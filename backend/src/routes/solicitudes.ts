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
        `SELECT 1 - (mo.embedding <=> md.embedding) AS similitud
         FROM materias mo, materias md
         WHERE mo.id = $1 AND md.id = $2`,
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
            (SELECT COUNT(*) FROM items_solicitud i WHERE i.solicitud_id = s.id) AS total_items
     FROM solicitudes_equivalencia s
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     WHERE s.estudiante_id = $1
     ORDER BY s.creada_en DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

router.get("/pendientes", requireAuth, requireRole("evaluador"), async (_req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en,
            est.nombre AS estudiante_nombre, est.email AS estudiante_email,
            c.nombre AS carrera_destino_nombre, u.nombre AS universidad_destino_nombre,
            (SELECT COUNT(*) FROM items_solicitud i WHERE i.solicitud_id = s.id) AS total_items
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
     WHERE s.estado = 'pendiente'
     ORDER BY s.creada_en ASC`
  );
  res.json(rows);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const cab = await query(
    `SELECT s.id, s.numero_tramite, s.estado, s.creada_en, s.resuelta_en, s.comentario_resolucion,
            s.estudiante_id, est.nombre AS estudiante_nombre, est.email AS estudiante_email,
            c.id AS carrera_destino_id, c.nombre AS carrera_destino_nombre,
            u.nombre AS universidad_destino_nombre,
            ev.nombre AS evaluador_nombre
     FROM solicitudes_equivalencia s
     JOIN usuarios est ON est.id = s.estudiante_id
     JOIN carreras c ON c.id = s.carrera_destino_id
     JOIN universidades u ON u.id = c.universidad_id
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
    `SELECT i.id, i.similitud, i.estado, i.comentario,
            mo.id AS materia_origen_id, mo.nombre AS materia_origen_nombre,
            mo.cre AS cre_origen, mo.horas_interaccion AS horas_int_origen,
            mo.horas_autonomo AS horas_aut_origen, mo.contenido_texto AS contenido_origen,
            co.nombre AS carrera_origen_nombre, uo.nombre AS universidad_origen_nombre,
            md.id AS materia_destino_id, md.nombre AS materia_destino_nombre,
            md.cre AS cre_destino, md.horas_interaccion AS horas_int_destino,
            md.horas_autonomo AS horas_aut_destino, md.contenido_texto AS contenido_destino
     FROM items_solicitud i
     JOIN materias mo ON mo.id = i.materia_origen_id
     JOIN carreras co ON co.id = mo.carrera_id
     JOIN universidades uo ON uo.id = co.universidad_id
     JOIN materias md ON md.id = i.materia_destino_id
     WHERE i.solicitud_id = $1
     ORDER BY i.id`,
    [id]
  );

  res.json({ ...sol, items: items.rows });
});

// Evaluador resuelve la solicitud completa.
router.put("/:id", requireAuth, requireRole("evaluador"), async (req, res) => {
  const id = Number(req.params.id);
  const { estado, comentario } = req.body as { estado?: "aprobada" | "rechazada"; comentario?: string };
  if (estado !== "aprobada" && estado !== "rechazada") {
    return res.status(400).json({ error: "estado debe ser 'aprobada' o 'rechazada'" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const upd = await client.query(
      `UPDATE solicitudes_equivalencia
       SET estado = $1, comentario_resolucion = $2, evaluador_id = $3, resuelta_en = NOW()
       WHERE id = $4 AND estado = 'pendiente'
       RETURNING id, estado`,
      [estado, comentario?.trim() || null, req.user!.id, id]
    );
    if (upd.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "solicitud no pendiente o inexistente" });
    }
    await client.query(`UPDATE items_solicitud SET estado = $1 WHERE solicitud_id = $2`, [estado, id]);
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
