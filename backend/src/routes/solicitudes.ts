import { Router } from "express";
import { pool, query } from "../db";
import { requireAuth, requireRole } from "../auth";

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

export default router;
