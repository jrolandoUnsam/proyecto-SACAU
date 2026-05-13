import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

router.get("/", requireAuth, requireRole("estudiante"), async (req, res) => {
  const { rows } = await query(
    `SELECT h.id, h.materia_id, h.nota, h.fecha_aprobacion,
            m.nombre AS materia_nombre, m.cre, m.contenido_texto,
            c.nombre AS carrera_nombre, u.nombre AS universidad_nombre
     FROM historial_academico h
     JOIN materias m ON m.id = h.materia_id
     JOIN carreras c ON c.id = m.carrera_id
     JOIN universidades u ON u.id = c.universidad_id
     WHERE h.usuario_id = $1
     ORDER BY h.fecha_aprobacion DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

export default router;
