import { Router } from "express";
import multer from "multer";
import { query, vectorLiteral } from "../db";
import { requireAuth, requireRole } from "../auth";
import { embedPdf, embedText } from "../nlp";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/", requireAuth, requireRole("administrador"), upload.single("pdf"), async (req, res) => {
  const body = req.body as Record<string, string | undefined>;
  const carrera_id = Number(body.carrera_id);
  const nombre = body.nombre?.trim();
  const cre = Number(body.cre);
  const horas_interaccion = body.horas_interaccion ? Number(body.horas_interaccion) : null;
  const horas_autonomo = body.horas_autonomo ? Number(body.horas_autonomo) : null;
  let contenido_texto = body.contenido_texto?.trim() || "";

  if (!carrera_id || !nombre || !cre) {
    return res.status(400).json({ error: "carrera_id, nombre y cre son requeridos" });
  }

  let embedding: number[];
  try {
    if (req.file) {
      const result = await embedPdf(req.file.buffer, req.file.originalname || "programa.pdf");
      contenido_texto = result.text;
      embedding = result.embedding;
    } else {
      if (!contenido_texto) return res.status(400).json({ error: "se requiere PDF o contenido_texto" });
      embedding = await embedText(contenido_texto);
    }
  } catch (err: any) {
    return res.status(502).json({ error: "fallo NLP", detail: err?.message || String(err) });
  }

  const { rows } = await query(
    `INSERT INTO materias (carrera_id, nombre, cre, horas_interaccion, horas_autonomo, contenido_texto, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
     RETURNING id, carrera_id, nombre, cre, horas_interaccion, horas_autonomo, contenido_texto`,
    [carrera_id, nombre, cre, horas_interaccion, horas_autonomo, contenido_texto, vectorLiteral(embedding)]
  );
  res.status(201).json(rows[0]);
});

router.delete("/:id", requireAuth, requireRole("administrador"), async (req, res) => {
  await query("DELETE FROM materias WHERE id = $1", [Number(req.params.id)]);
  res.status(204).end();
});

export default router;
