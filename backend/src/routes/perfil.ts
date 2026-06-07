import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

router.get("/resumen", requireAuth, requireRole("estudiante"), async (req, res) => {
  const uid = req.user!.id;

  const [materias, solicitudes] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total_materias, COALESCE(SUM(m.cre), 0)::int AS total_cre
       FROM historial_academico h
       JOIN materias m ON m.id = h.materia_id
       WHERE h.usuario_id = $1`,
      [uid]
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'pendiente')::int AS solicitudes_pendientes,
         COUNT(*) FILTER (WHERE estado IN ('aprobada', 'aprobada_parcial'))::int AS solicitudes_aprobadas
       FROM solicitudes_equivalencia
       WHERE estudiante_id = $1`,
      [uid]
    ),
  ]);

  res.json({
    ...materias.rows[0],
    ...solicitudes.rows[0],
  });
});

export default router;
