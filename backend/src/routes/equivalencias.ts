import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

// Para cada materia aprobada del estudiante, busca la mejor coincidencia
// en la carrera destino usando similitud coseno con pgvector.
router.post("/preview", requireAuth, requireRole("estudiante"), async (req, res) => {
  const carrera_destino_id = Number((req.body as any)?.carrera_destino_id);
  if (!carrera_destino_id) return res.status(400).json({ error: "carrera_destino_id requerido" });

  const { rows } = await query(
    `WITH historial AS (
       SELECT m.id AS materia_origen_id, m.nombre AS materia_origen_nombre,
              m.cre AS cre_origen, m.contenido_texto AS contenido_origen,
              m.embedding AS embedding_origen,
              c.nombre AS carrera_origen_nombre, u.nombre AS universidad_origen_nombre
       FROM historial_academico h
       JOIN materias m ON m.id = h.materia_id
       JOIN carreras c ON c.id = m.carrera_id
       JOIN universidades u ON u.id = c.universidad_id
       WHERE h.usuario_id = $1
     ),
     mejor AS (
       SELECT
         h.materia_origen_id,
         h.materia_origen_nombre,
         h.cre_origen,
         h.contenido_origen,
         h.carrera_origen_nombre,
         h.universidad_origen_nombre,
         m2.id AS materia_destino_id,
         m2.nombre AS materia_destino_nombre,
         m2.cre AS cre_destino,
         m2.contenido_texto AS contenido_destino,
         1 - (h.embedding_origen <=> m2.embedding) AS similitud,
         ROW_NUMBER() OVER (
           PARTITION BY h.materia_origen_id
           ORDER BY h.embedding_origen <=> m2.embedding
         ) AS rn
       FROM historial h
       JOIN materias m2 ON m2.carrera_id = $2
     )
     SELECT * FROM mejor WHERE rn = 1 ORDER BY similitud DESC`,
    [req.user!.id, carrera_destino_id]
  );
  res.json(rows);
});

export default router;
