import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query, pool, vectorLiteral } from "../db";
import { requireAuth, requireRole } from "../auth";
import { embedText, embedBatch } from "../nlp";
import { dividirFrases } from "../utils";
import { extractPlanFromPdf } from "../planExtractor";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.get("/", async (req, res) => {
  const universidadId = req.query.universidad_id ? Number(req.query.universidad_id) : null;
  const { rows } = universidadId
    ? await query(
        `SELECT c.id, c.nombre, c.total_cre, c.plan_pdf, c.universidad_id, u.nombre AS universidad_nombre
         FROM carreras c JOIN universidades u ON u.id = c.universidad_id
         WHERE c.universidad_id = $1 ORDER BY c.nombre`,
        [universidadId]
      )
    : await query(
        `SELECT c.id, c.nombre, c.total_cre, c.plan_pdf, c.universidad_id, u.nombre AS universidad_nombre
         FROM carreras c JOIN universidades u ON u.id = c.universidad_id ORDER BY u.nombre, c.nombre`
      );
  res.json(rows);
});

router.get("/:id/materias", async (req, res) => {
  const { rows } = await query(
    `SELECT id, nombre, cre, anio, horas_interaccion, horas_autonomo, contenido_texto
     FROM materias WHERE carrera_id = $1 ORDER BY anio NULLS LAST, nombre`,
    [Number(req.params.id)]
  );
  res.json(rows);
});

router.post("/", requireAuth, requireRole("administrador"), async (req, res) => {
  const { universidad_id, nombre, total_cre } = req.body as {
    universidad_id?: number;
    nombre?: string;
    total_cre?: number;
  };
  if (!universidad_id || !nombre) return res.status(400).json({ error: "universidad_id y nombre requeridos" });
  const { rows } = await query(
    "INSERT INTO carreras (universidad_id, nombre, total_cre) VALUES ($1, $2, $3) RETURNING id, nombre, total_cre, universidad_id",
    [universidad_id, nombre.trim(), total_cre ?? null]
  );
  res.status(201).json(rows[0]);
});

router.post(
  "/upload-pdf",
  requireAuth,
  requireRole("administrador"),
  upload.single("pdf"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Se requiere un archivo PDF" });
    const universidadId = req.user?.universidad_id;
    if (!universidadId) return res.status(400).json({ error: "El administrador no tiene universidad asignada" });

    let plan;
    try {
      plan = await extractPlanFromPdf(req.file.buffer);
    } catch (err: any) {
      return res.status(422).json({ error: err.message || "Error procesando el PDF" });
    }

    // Verificar si la carrera ya existe
    const { rows: existing } = await query(
      `SELECT id, nombre FROM carreras WHERE universidad_id = $1 AND nombre = $2`,
      [universidadId, plan.carrera_nombre.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        error: `La carrera "${existing[0].nombre}" ya fue procesada. Podés verla en la lista de carreras.`,
      });
    }

    const safeBase = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pdfFilename = `${Date.now()}-${safeBase}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, pdfFilename), req.file.buffer);
    const planPdfPath = `api/uploads/${pdfFilename}`;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: [carrera] } = await client.query(
        `INSERT INTO carreras (universidad_id, nombre, total_cre, plan_pdf)
         VALUES ($1, $2, $3, $4) RETURNING id, nombre, total_cre, universidad_id`,
        [universidadId, plan.carrera_nombre.trim(), plan.total_cre || null, planPdfPath]
      );

      for (const mat of plan.materias) {
        const contenido = mat.contenido_texto?.trim() || mat.nombre;

        // Buscar embedding pre-computado en cache
        const { rows: cached } = await client.query(
          `SELECT embedding::text, frases,
                  (SELECT array_agg(v::text) FROM unnest(frases_embeddings) v) AS frases_embeddings
           FROM embedding_cache WHERE nombre = $1`,
          [mat.nombre.trim()]
        );

        let embedding: number[];
        let frases: string[];
        let embedsFrases: number[][];

        if (cached.length > 0) {
          const raw = cached[0].embedding as string;
          embedding = raw.replace(/^\[|\]$/g, "").split(",").map(Number);
          frases = cached[0].frases as string[];
          embedsFrases = ((cached[0].frases_embeddings as string[]) ?? []).map((v) =>
            v.replace(/^\[|\]$/g, "").split(",").map(Number)
          );
        } else {
          embedding = await embedText(contenido);
          frases = dividirFrases(contenido);
          embedsFrases = frases.length > 0 ? await embedBatch(frases) : [];
        }

        const { rows: [m] } = await client.query(
          `INSERT INTO materias (carrera_id, nombre, cre, anio, horas_interaccion, horas_autonomo, contenido_texto, embedding)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector) RETURNING id`,
          [
            carrera.id,
            mat.nombre.trim(),
            mat.cre || 0,
            mat.anio || null,
            mat.horas_interaccion || 0,
            mat.horas_autonomo || 0,
            contenido,
            vectorLiteral(embedding),
          ]
        );

        for (let i = 0; i < frases.length; i++) {
          await client.query(
            `INSERT INTO materia_frases (materia_id, indice, frase, embedding) VALUES ($1, $2, $3, $4::vector)`,
            [m.id, i, frases[i], vectorLiteral(embedsFrases[i])]
          );
        }
      }

      // Demo: cargar historial académico de Ana (1° y 2° año) si corresponde a UNAHUR Nutrición
      const ANA_HISTORIAL = [
        { nombre: "Cultura y alfabetización digital en la universidad", nota: 8,  fecha: "2023-07-10" },
        { nombre: "Bioquímica",                                          nota: 7,  fecha: "2023-07-12" },
        { nombre: "Introducción a la Nutrición",                         nota: 9,  fecha: "2023-07-14" },
        { nombre: "Anátomo-Fisiología I",                                nota: 8,  fecha: "2023-07-17" },
        { nombre: "Introducción a la Salud Comunitaria",                 nota: 7,  fecha: "2023-07-19" },
        { nombre: "Idioma extranjero",                                   nota: 9,  fecha: "2023-12-05" },
        { nombre: "Anátomo-Fisiología II",                               nota: 7,  fecha: "2023-12-07" },
        { nombre: "Salud Comunitaria I",                                 nota: 8,  fecha: "2023-12-10" },
        { nombre: "Bioquímica Aplicada",                                 nota: 7,  fecha: "2023-12-12" },
        { nombre: "Fundamentos de la Nutrición",                         nota: 9,  fecha: "2023-12-14" },
        { nombre: "Microbiología",                                       nota: 8,  fecha: "2024-07-08" },
        { nombre: "Salud Comunitaria II",                                nota: 7,  fecha: "2024-07-10" },
        { nombre: "Introducción a la Tecnología de los Alimentos",       nota: 8,  fecha: "2024-07-12" },
        { nombre: "Nutrición en la Infancia y la Adolescencia",          nota: 9,  fecha: "2024-07-15" },
        { nombre: "Técnica en el Manejo de los Alimentos I",             nota: 7,  fecha: "2024-07-17" },
        { nombre: "Psicología",                                          nota: 9,  fecha: "2024-12-03" },
        { nombre: "Antropología",                                        nota: 8,  fecha: "2024-12-05" },
        { nombre: "Salud Comunitaria III",                               nota: 7,  fecha: "2024-12-08" },
        { nombre: "Bromatología y Microbiología de los Alimentos",       nota: 8,  fecha: "2024-12-10" },
        { nombre: "Técnica en el Manejo de los Alimentos II",            nota: 9,  fecha: "2024-12-12" },
      ];
      const { rows: anaRows } = await client.query(
        `SELECT id FROM usuarios WHERE email = 'ana@belgrano.edu.ar'`
      );
      if (anaRows.length > 0) {
        const anaId = anaRows[0].id;
        await client.query(
          `UPDATE usuarios SET carrera_id = $1 WHERE id = $2`,
          [carrera.id, anaId]
        );
        for (const h of ANA_HISTORIAL) {
          const { rows: matRows } = await client.query(
            `SELECT id FROM materias WHERE carrera_id = $1 AND nombre = $2`,
            [carrera.id, h.nombre]
          );
          if (matRows.length > 0) {
            await client.query(
              `INSERT INTO historial_academico (usuario_id, materia_id, nota, fecha_aprobacion)
               VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
              [anaId, matRows[0].id, h.nota, h.fecha]
            );
          }
        }
        console.log(`[upload-pdf] historial de Ana cargado (${ANA_HISTORIAL.length} materias)`);
      }

      await client.query("COMMIT");
      res.status(201).json({ carrera, materias_count: plan.materias.length });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("[upload-pdf] error insertando:", err);
      const msg = err.code === "23505"
        ? `La carrera "${plan.carrera_nombre}" ya existe para esta universidad.`
        : "Error guardando los datos en la base de datos";
      res.status(500).json({ error: msg });
    } finally {
      client.release();
    }
  }
);

export default router;
