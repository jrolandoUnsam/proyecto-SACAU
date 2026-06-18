import { Router } from "express";
import { pool, query } from "../db";
import { requireAuth, requireRole } from "../auth";
import PDFDocument from "pdfkit";

const router = Router();

function generarNumeroTramite(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `EQ-${year}-${rand}`;
}

// Estudiante crea una solicitud con sus items elegidos.
router.post("/", requireAuth, requireRole("estudiante"), async (req, res) => {
  const { carrera_destino_id, items } = req.body as {
    carrera_destino_id?: number;
    items?: { materia_origen_id: number; materia_destino_id: number }[];
  };
  if (!carrera_destino_id || !items?.length) {
    return res.status(400).json({ error: "carrera_destino_id e items requeridos" });
  }

  const existe = await query(
    `SELECT numero_tramite FROM solicitudes_equivalencia
     WHERE estudiante_id = $1 AND carrera_destino_id = $2 AND estado NOT IN ('rechazada', 'cancelada')
     LIMIT 1`,
    [req.user!.id, carrera_destino_id]
  );
  if (existe.rows.length > 0) {
    return res.status(409).json({
      error: "Ya existe una solicitud activa para esta carrera",
      numero_tramite: existe.rows[0].numero_tramite,
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const numero = generarNumeroTramite();
    const sol = await client.query(
      `INSERT INTO solicitudes_equivalencia (numero_tramite, estudiante_id, carrera_destino_id)
       VALUES ($1, $2, $3) RETURNING id, numero_tramite, estado, creada_en`,
      [numero, req.user!.id, carrera_destino_id]
    );
    const solicitudId = sol.rows[0].id;

    for (const item of items) {
      const sim = await client.query(
        `WITH
         frases_o AS (SELECT id, embedding FROM materia_frases WHERE materia_id = $1),
         frases_d AS (SELECT id, embedding FROM materia_frases WHERE materia_id = $2),
         stats AS (
           SELECT
             COUNT(DISTINCT fd.id) AS total_d,
             COUNT(DISTINCT fd.id) FILTER (WHERE 1 - (fo.embedding <=> fd.embedding) >= 0.70) AS matched_d
           FROM frases_o fo CROSS JOIN frases_d fd
         )
         SELECT CASE WHEN total_d > 0 THEN matched_d::float / total_d ELSE 0 END AS similitud
         FROM stats`,
        [item.materia_origen_id, item.materia_destino_id]
      );
      const similitud = sim.rows[0]?.similitud ?? 0;
      await client.query(
        `INSERT INTO items_solicitud (solicitud_id, materia_origen_id, materia_destino_id, similitud)
         VALUES ($1, $2, $3, $4)`,
        [solicitudId, item.materia_origen_id, item.materia_destino_id, similitud]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(sol.rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err?.message || "error al crear solicitud" });
  } finally {
    client.release();
  }
});

router.get("/mis", requireAuth, requireRole("estudiante"), async (req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en, s.resuelta_en, s.comentario_resolucion,
            c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            (SELECT COUNT(DISTINCT i.materia_destino_id) FROM items_solicitud i WHERE i.solicitud_id = s.id) AS total_items
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     LEFT JOIN carreras co ON co.id = est.carrera_id
     LEFT JOIN universidades uo ON uo.id = co.universidad_id
     WHERE s.estudiante_id = $1
     ORDER BY s.creada_en DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

router.get("/pendientes", requireAuth, requireRole("evaluador"), async (_req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en,
            est.nombre AS estudiante_nombre, est.dni AS estudiante_dni,
            c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            (SELECT COUNT(DISTINCT i.materia_destino_id) FROM items_solicitud i WHERE i.solicitud_id = s.id) AS total_items
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     LEFT JOIN carreras co ON co.id = est.carrera_id
     LEFT JOIN universidades uo ON uo.id = co.universidad_id
     WHERE s.estado = 'pendiente'
     ORDER BY s.creada_en ASC`
  );
  res.json(rows);
});

router.get("/resueltas", requireAuth, requireRole("evaluador"), async (_req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en, s.resuelta_en, s.comentario_resolucion,
            est.nombre AS estudiante_nombre, est.dni AS estudiante_dni,
            c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            (SELECT COUNT(DISTINCT i.materia_destino_id) FROM items_solicitud i WHERE i.solicitud_id = s.id) AS total_items
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     LEFT JOIN carreras co ON co.id = est.carrera_id
     LEFT JOIN universidades uo ON uo.id = co.universidad_id
     WHERE s.estado != 'pendiente'
     ORDER BY s.resuelta_en DESC`
  );
  res.json(rows);
});

// Estudiante: materias de solicitudes aprobadas/parciales (solo ítems aprobados/parciales).
router.get("/mis-aprobadas", requireAuth, requireRole("estudiante"), async (req, res) => {
  const { rows } = await query(
    `SELECT
       s.id AS solicitud_id, s.numero_tramite, s.resuelta_en,
       s.comentario_resolucion, s.estado AS solicitud_estado,
       c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
       i.id AS item_id, i.estado AS item_estado, i.comentario AS item_comentario, i.similitud, i.nota AS item_nota,
       md.nombre AS materia_destino_nombre, md.cre AS materia_destino_cre, md.anio AS materia_destino_anio,
       mo.nombre AS materia_origen_nombre
     FROM solicitudes_equivalencia s
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     JOIN items_solicitud i ON i.solicitud_id = s.id
     JOIN materias md ON md.id = i.materia_destino_id
     JOIN materias mo ON mo.id = i.materia_origen_id
     WHERE s.estudiante_id = $1
       AND s.estado IN ('aprobada', 'aprobada_parcial')
       AND i.estado IN ('aprobada', 'aprobada_parcial')
     ORDER BY s.resuelta_en DESC, md.anio NULLS LAST, md.nombre`,
    [req.user!.id]
  );

  const map = new Map<number, any>();
  for (const row of rows) {
    if (!map.has(row.solicitud_id)) {
      map.set(row.solicitud_id, {
        solicitud_id: row.solicitud_id,
        numero_tramite: row.numero_tramite,
        resuelta_en: row.resuelta_en,
        comentario_resolucion: row.comentario_resolucion,
        solicitud_estado: row.solicitud_estado,
        carrera_destino_nombre: row.carrera_destino_nombre,
        universidad_destino_nombre: row.universidad_destino_nombre,
        items: [],
      });
    }
    map.get(row.solicitud_id).items.push({
      item_id: row.item_id,
      estado: row.item_estado,
      comentario: row.item_comentario,
      similitud: row.similitud,
      nota: row.item_nota,
      materia_destino_nombre: row.materia_destino_nombre,
      materia_destino_cre: row.materia_destino_cre,
      materia_destino_anio: row.materia_destino_anio,
      materia_origen_nombre: row.materia_origen_nombre,
    });
  }

  res.json(Array.from(map.values()));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const cab = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en, s.resuelta_en, s.comentario_resolucion,
            s.estudiante_id, est.nombre AS estudiante_nombre, est.email AS estudiante_email,
            est.dni AS estudiante_dni,
            c.id AS carrera_destino_id, c.nombre AS carrera_destino_nombre,
            u.nombre AS universidad_destino_nombre,
            co.plan_pdf AS plan_pdf_origen,
            c.plan_pdf AS plan_pdf_destino,
            ev.nombre AS evaluador_nombre
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     LEFT JOIN carreras co ON co.id = est.carrera_id
     LEFT JOIN usuarios ev ON ev.id = s.evaluador_id
     WHERE s.id = $1`,
    [id]
  );
  if (cab.rows.length === 0) return res.status(404).json({ error: "no encontrada" });
  const sol = cab.rows[0];
  if (req.user!.rol === "estudiante" && sol.estudiante_id !== req.user!.id) {
    return res.status(403).json({ error: "no autorizada" });
  }

  const items = await query(
    `SELECT i.id, i.similitud, i.estado, i.comentario, i.nota,
            mo.id AS materia_origen_id, mo.nombre AS materia_origen_nombre,
            mo.cre AS cre_origen, mo.horas_interaccion AS horas_int_origen,
            mo.horas_autonomo AS horas_aut_origen, mo.contenido_texto AS contenido_origen,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            ha.nota AS nota_historial,
            md.id AS materia_destino_id, md.nombre AS materia_destino_nombre,
            md.anio AS anio_destino,
            md.cre AS cre_destino, md.horas_interaccion AS horas_int_destino,
            md.horas_autonomo AS horas_aut_destino, md.contenido_texto AS contenido_destino
     FROM items_solicitud i
     JOIN solicitudes_equivalencia s ON s.id = i.solicitud_id
     JOIN materias mo ON mo.id = i.materia_origen_id
     JOIN carreras co ON co.id = mo.carrera_id
     JOIN universidades uo ON uo.id = co.universidad_id
     LEFT JOIN historial_academico ha ON ha.materia_id = i.materia_origen_id AND ha.usuario_id = s.estudiante_id
     JOIN materias md ON md.id = i.materia_destino_id
     WHERE i.solicitud_id = $1
     ORDER BY md.anio NULLS LAST, md.nombre, i.id`,
    [id]
  );

  res.json({ ...sol, items: items.rows });
});

// Estudiante cancela su propia solicitud pendiente.
router.patch("/:id/cancelar", requireAuth, requireRole("estudiante"), async (req, res) => {
  const id = Number(req.params.id);
  const { comentario } = req.body as { comentario?: string };

  const upd = await query(
    `UPDATE solicitudes_equivalencia
     SET estado = 'cancelada', comentario_resolucion = $1, resuelta_en = NOW()
     WHERE id = $2 AND estudiante_id = $3 AND estado = 'pendiente'
     RETURNING id, estado`,
    [comentario?.trim() || null, id, req.user!.id]
  );

  if (upd.rowCount === 0) {
    return res.status(409).json({ error: "Solicitud no encontrada, no pertenece al usuario o no está pendiente" });
  }
  res.json(upd.rows[0]);
});

// Evaluador resuelve la solicitud.
// Body: { items_estado: { "<itemId>": "aprobada"|"rechazada", ... }, comentario?: string, comentarios_items?: { "<itemId>": string } }
// La solicitud queda: aprobada (todos aprobados) | rechazada (todos rechazados) | aprobada_parcial (mixto).
router.put("/:id", requireAuth, requireRole("evaluador"), async (req, res) => {
  const id = Number(req.params.id);
  const { items_estado, comentario, comentarios_items, notas_items } = req.body as {
    items_estado?: Record<string, "aprobada" | "aprobada_parcial" | "rechazada">;
    comentario?: string;
    comentarios_items?: Record<string, string>;
    notas_items?: Record<string, number | null>;
  };

  const entradas = Object.entries(items_estado ?? {});
  if (!entradas.length) {
    return res.status(400).json({ error: "items_estado requerido con al menos un ítem" });
  }
  const valoresValidos = new Set(["aprobada", "aprobada_parcial", "rechazada"]);
  for (const [, v] of entradas) {
    if (!valoresValidos.has(v)) {
      return res.status(400).json({ error: `estado inválido: ${v}` });
    }
  }

  const valores = entradas.map(([, v]) => v);
  const todoAprobado = valores.every((v) => v === "aprobada");
  const todoRechazado = valores.every((v) => v === "rechazada");
  const estadoFinal = todoAprobado ? "aprobada" : todoRechazado ? "rechazada" : "aprobada_parcial";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [itemId, estado] of entradas) {
      const comentarioItem = comentarios_items?.[itemId]?.trim() || null;
      const notaItem = notas_items?.[itemId] ?? null;
      await client.query(
        `UPDATE items_solicitud SET estado = $1, comentario = $2, nota = $3 WHERE id = $4 AND solicitud_id = $5`,
        [estado, comentarioItem, notaItem, Number(itemId), id]
      );
    }

    const upd = await client.query(
      `UPDATE solicitudes_equivalencia
       SET estado = $1, comentario_resolucion = $2, evaluador_id = $3, resuelta_en = NOW()
       WHERE id = $4 AND estado = 'pendiente'
       RETURNING id, estado`,
      [estadoFinal, comentario?.trim() || null, req.user!.id, id]
    );

    if (upd.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "solicitud no pendiente o inexistente" });
    }

    await client.query("COMMIT");
    res.json(upd.rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err?.message || "error al resolver" });
  } finally {
    client.release();
  }
});

router.get("/:id/comprobante", requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  const cab = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en, s.resuelta_en, s.comentario_resolucion,
            s.estudiante_id,
            est.nombre AS estudiante_nombre, est.email AS estudiante_email, est.dni AS estudiante_dni,
            c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            ev.nombre AS evaluador_nombre
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     LEFT JOIN carreras co ON co.id = est.carrera_id
     LEFT JOIN universidades uo ON uo.id = co.universidad_id
     LEFT JOIN usuarios ev ON ev.id = s.evaluador_id
     WHERE s.id = $1`,
    [id]
  );

  if (cab.rows.length === 0) return res.status(404).json({ error: "no encontrada" });
  const sol = cab.rows[0];

  if (req.user!.rol === "estudiante" && sol.estudiante_id !== req.user!.id)
    return res.status(403).json({ error: "no autorizada" });
  if (sol.estado === "pendiente" || sol.estado === "cancelada")
    return res.status(400).json({ error: "La solicitud no está resuelta aún" });

  const its = await query(
    `SELECT i.similitud, i.estado, i.comentario, i.nota,
            mo.nombre AS materia_origen_nombre,
            md.nombre AS materia_destino_nombre
     FROM items_solicitud i
     JOIN materias mo ON mo.id = i.materia_origen_id
     JOIN materias md ON md.id = i.materia_destino_id
     WHERE i.solicitud_id = $1
     ORDER BY md.anio NULLS LAST, md.nombre`,
    [id]
  );

  const ESTADO_LABEL: Record<string, string> = {
    aprobada: "APROBADA",
    aprobada_parcial: "APROBADA PARCIALMENTE",
    rechazada: "RECHAZADA",
  };
  const ITEM_LABEL: Record<string, string> = {
    aprobada: "Aprobada",
    aprobada_parcial: "Aprob. parcial",
    rechazada: "Rechazada",
    pendiente: "Pendiente",
  };
  const ITEM_COLOR: Record<string, string> = {
    aprobada: "#155724",
    aprobada_parcial: "#004085",
    rechazada: "#721c24",
    pendiente: "#856404",
  };
  const RES_BG: Record<string, string> = {
    aprobada: "#d4edda",
    aprobada_parcial: "#cce5ff",
    rechazada: "#f8d7da",
  };
  const RES_FG: Record<string, string> = {
    aprobada: "#155724",
    aprobada_parcial: "#004085",
    rechazada: "#721c24",
  };

  const trunc = (s: string | null | undefined, n: number) =>
    s && s.length > n ? s.slice(0, n - 1) + "…" : (s ?? "—");
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-AR");

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="comprobante-${sol.numero_tramite}.pdf"`
  );
  doc.pipe(res);

  // ─── HEADER ────────────────────────────────────────────────────────────
  doc.rect(50, 50, 495, 56).fill("#1e3a5f");
  doc.fillColor("white")
    .fontSize(13).font("Helvetica-Bold")
    .text("Comprobante de Resolución de Equivalencias", 62, 62, { width: 471 });
  doc.fontSize(10).font("Helvetica")
    .text("SUCU · Sistema Único de Créditos Unificados", 62, 82, { width: 471 });

  // ─── N° TRÁMITE / FECHA ────────────────────────────────────────────────
  doc.fillColor("black").fontSize(10);
  doc.font("Helvetica-Bold").text("N° de trámite:", 50, 122);
  doc.font("Helvetica").text(sol.numero_tramite, 150, 122);
  if (sol.resuelta_en) {
    doc.font("Helvetica-Bold").text("Fecha de resolución:", 325, 122);
    doc.font("Helvetica").text(fmtDate(sol.resuelta_en), 463, 122);
  }
  doc.moveTo(50, 140).lineTo(545, 140).strokeColor("#cccccc").lineWidth(0.5).stroke();

  // ─── DATOS DEL ESTUDIANTE ──────────────────────────────────────────────
  doc.rect(50, 148, 495, 17).fill("#e8eef4");
  doc.fillColor("#1e3a5f").fontSize(9).font("Helvetica-Bold")
    .text("DATOS DEL ESTUDIANTE", 55, 154);
  doc.fillColor("black").fontSize(10);
  doc.font("Helvetica-Bold").text("Nombre:", 50, 175);
  doc.font("Helvetica").text(sol.estudiante_nombre ?? "—", 115, 175);
  doc.font("Helvetica-Bold").text("DNI:", 340, 175);
  doc.font("Helvetica").text(sol.estudiante_dni ?? "—", 365, 175);
  doc.font("Helvetica-Bold").text("Email:", 50, 191);
  doc.font("Helvetica").text(sol.estudiante_email ?? "—", 115, 191);
  doc.moveTo(50, 208).lineTo(545, 208).strokeColor("#cccccc").lineWidth(0.5).stroke();

  // ─── TRANSFERENCIA ────────────────────────────────────────────────────
  doc.rect(50, 216, 495, 17).fill("#e8eef4");
  doc.fillColor("#1e3a5f").fontSize(9).font("Helvetica-Bold").text("TRANSFERENCIA", 55, 222);

  const yB = 242;
  doc.rect(50, yB, 218, 42).strokeColor("#b0c8e0").lineWidth(0.5).stroke();
  doc.fillColor("#5a8fc0").fontSize(8).font("Helvetica-Bold").text("ORIGEN", 56, yB + 4);
  doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica-Bold")
    .text(trunc(sol.universidad_origen_nombre, 32), 56, yB + 16, { width: 206, lineBreak: false });
  doc.fontSize(8).font("Helvetica")
    .text(trunc(sol.carrera_origen_nombre, 40), 56, yB + 29, { width: 206, lineBreak: false });

  doc.fillColor("#666").fontSize(18).font("Helvetica")
    .text("→", 276, yB + 13, { width: 36, align: "center", lineBreak: false });

  doc.rect(317, yB, 228, 42).strokeColor("#80c8a0").lineWidth(0.5).stroke();
  doc.fillColor("#3a8f60").fontSize(8).font("Helvetica-Bold").text("DESTINO", 323, yB + 4);
  doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica-Bold")
    .text(trunc(sol.universidad_destino_nombre, 32), 323, yB + 16, { width: 218, lineBreak: false });
  doc.fontSize(8).font("Helvetica")
    .text(trunc(sol.carrera_destino_nombre, 40), 323, yB + 29, { width: 218, lineBreak: false });

  // ─── RESULTADO ────────────────────────────────────────────────────────
  const yRes = 298;
  doc.rect(50, yRes, 495, 28).fill(RES_BG[sol.estado] ?? "#f0f0f0");
  doc.fillColor(RES_FG[sol.estado] ?? "#333")
    .fontSize(12).font("Helvetica-Bold")
    .text(
      `RESULTADO: ${ESTADO_LABEL[sol.estado] ?? sol.estado.toUpperCase()}`,
      55, yRes + 8, { width: 485, align: "center", lineBreak: false }
    );

  let yCur = yRes + 36;
  doc.fillColor("black").fontSize(10);

  if (sol.evaluador_nombre) {
    doc.font("Helvetica-Bold").text("Evaluador: ", 50, yCur, { continued: true });
    doc.font("Helvetica").text(sol.evaluador_nombre);
    yCur = doc.y + 3;
  }
  if (sol.comentario_resolucion) {
    doc.font("Helvetica-Bold").text("Comentario: ", 50, yCur, { continued: true });
    doc.font("Helvetica-Oblique").text(sol.comentario_resolucion, { width: 490 });
    yCur = doc.y + 3;
  }
  yCur += 10;

  // ─── TABLA DE MATERIAS ────────────────────────────────────────────────
  doc.rect(50, yCur, 495, 17).fill("#e8eef4");
  doc.fillColor("#1e3a5f").fontSize(9).font("Helvetica-Bold")
    .text("DETALLE DE MATERIAS", 55, yCur + 5);
  yCur += 19;

  const X = [50, 198, 346, 406, 463];
  const W = [146, 146, 58, 55, 82];
  const HEADERS = ["Materia Destino", "Materia Origen", "Similitud", "Estado", "Nota"];
  const ROW_H = 16;

  doc.rect(50, yCur, 495, ROW_H).fill("#d0dde8");
  doc.fillColor("#1e3a5f").fontSize(8).font("Helvetica-Bold");
  for (let i = 0; i < HEADERS.length; i++) {
    doc.text(HEADERS[i], X[i] + 3, yCur + 4, { width: W[i] - 4, lineBreak: false });
  }
  yCur += ROW_H;

  for (let idx = 0; idx < its.rows.length; idx++) {
    const item = its.rows[idx];
    if (yCur + ROW_H > 780) {
      doc.addPage();
      yCur = 50;
    }
    if (idx % 2 === 1) doc.rect(50, yCur, 495, ROW_H).fill("#f4f7fb");

    const sim = `${Math.round(Number(item.similitud) * 100)}%`;
    const nota = item.nota != null ? Number(item.nota).toFixed(1) : "—";

    doc.fillColor("black").fontSize(8).font("Helvetica-Bold")
      .text(trunc(item.materia_destino_nombre, 24), X[0] + 3, yCur + 4, { width: W[0] - 4, lineBreak: false });
    doc.font("Helvetica")
      .text(trunc(item.materia_origen_nombre, 24), X[1] + 3, yCur + 4, { width: W[1] - 4, lineBreak: false });
    doc.text(sim, X[2] + 3, yCur + 4, { width: W[2] - 4, lineBreak: false });
    doc.fillColor(ITEM_COLOR[item.estado] ?? "#333").font("Helvetica-Bold")
      .text(ITEM_LABEL[item.estado] ?? item.estado, X[3] + 3, yCur + 4, { width: W[3] - 4, lineBreak: false });
    doc.fillColor("black").font("Helvetica")
      .text(nota, X[4] + 3, yCur + 4, { width: W[4] - 4, lineBreak: false });
    yCur += ROW_H;
  }

  // ─── FOOTER ───────────────────────────────────────────────────────────
  const yFoot = (doc.page.height as number) - 55;
  doc.moveTo(50, yFoot).lineTo(545, yFoot).strokeColor("#dddddd").lineWidth(0.5).stroke();
  doc.fillColor("#aaaaaa").fontSize(8).font("Helvetica")
    .text(
      `Generado el ${fmtDate(new Date().toISOString())} · SUCU — Sistema Único de Créditos Unificados`,
      50, yFoot + 8, { width: 495, align: "center" }
    );

  doc.end();
});

export default router;
