import { Router } from "express";
import { query, parseVector } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

router.get("/matriz", requireAuth, requireRole("estudiante"), async (req, res) => {
  const carrera_destino_id = Number(req.query.carrera_destino_id);
  if (!carrera_destino_id) return res.status(400).json({ error: "carrera_destino_id requerido" });

  const destino = await query(
    `SELECT id AS materia_destino_id, nombre, cre, anio, contenido_texto
     FROM materias WHERE carrera_id = $1 ORDER BY anio NULLS LAST, nombre`,
    [carrera_destino_id]
  );

  const origen = await query(
    `SELECT m.id AS materia_origen_id, m.nombre, m.cre, m.contenido_texto,
            c.nombre AS carrera_origen_nombre, u.nombre AS universidad_origen_nombre
     FROM historial_academico h
     JOIN materias m ON m.id = h.materia_id
     JOIN carreras c ON c.id = m.carrera_id
     JOIN universidades u ON u.id = c.universidad_id
     WHERE h.usuario_id = $1
     ORDER BY m.nombre`,
    [req.user!.id]
  );

  const similitudes = await query(
    `WITH
     frases_o AS (
       SELECT mf.id, mf.materia_id, mf.embedding
       FROM materia_frases mf
       WHERE mf.materia_id IN (
         SELECT materia_id FROM historial_academico WHERE usuario_id = $1
       )
     ),
     frases_d AS (
       SELECT mf.id, mf.materia_id, mf.embedding
       FROM materia_frases mf
       WHERE mf.materia_id IN (SELECT id FROM materias WHERE carrera_id = $2)
     ),
     stats AS (
       SELECT
         fo.materia_id AS materia_origen_id,
         fd.materia_id AS materia_destino_id,
         COUNT(DISTINCT fo.id)                                                                              AS total_o,
         COUNT(DISTINCT fd.id)                                                                              AS total_d,
         COUNT(DISTINCT fo.id) FILTER (WHERE 1 - (fo.embedding <=> fd.embedding) >= 0.70)                  AS matched_o,
         COUNT(DISTINCT fd.id) FILTER (WHERE 1 - (fo.embedding <=> fd.embedding) >= 0.70)                  AS matched_d
       FROM frases_o fo
       CROSS JOIN frases_d fd
       GROUP BY fo.materia_id, fd.materia_id
     )
     SELECT materia_origen_id, materia_destino_id,
            CASE WHEN total_d > 0
                 THEN matched_d::float / total_d
                 ELSE 0 END AS similitud
     FROM stats
     WHERE matched_d > 0`,
    [req.user!.id, carrera_destino_id]
  );

  res.json({ destino: destino.rows, origen: origen.rows, similitudes: similitudes.rows });
});

const UMBRAL_FRASE = 0.70;

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

router.get("/antecedentes", requireAuth, requireRole("evaluador"), async (req, res) => {
  const materia_origen_id = Number(req.query.materia_origen_id);
  const materia_destino_id = Number(req.query.materia_destino_id);
  if (!materia_origen_id || !materia_destino_id)
    return res.status(400).json({ error: "materia_origen_id y materia_destino_id requeridos" });

  const { rows } = await query(
    `SELECT
       s.numero_tramite,
       s.resuelta_en,
       i.estado,
       i.comentario,
       i.nota,
       u.nombre AS evaluador_nombre
     FROM items_solicitud i
     JOIN solicitudes_equivalencia s ON s.id = i.solicitud_id
     LEFT JOIN usuarios u ON u.id = s.evaluador_id
     WHERE i.materia_origen_id = $1
       AND i.materia_destino_id = $2
       AND i.estado <> 'pendiente'
     ORDER BY s.resuelta_en DESC
     LIMIT 20`,
    [materia_origen_id, materia_destino_id]
  );
  res.json(rows);
});

router.post("/resaltado", requireAuth, async (req, res) => {
  const { materia_a_id, materia_b_id } = req.body as { materia_a_id?: number; materia_b_id?: number };
  if (!materia_a_id || !materia_b_id) return res.json({ frases_a: [], frases_b: [] });

  const [resultA, resultB] = await Promise.all([
    query("SELECT frase, embedding::text FROM materia_frases WHERE materia_id = $1 ORDER BY indice", [materia_a_id]),
    query("SELECT frase, embedding::text FROM materia_frases WHERE materia_id = $1 ORDER BY indice", [materia_b_id]),
  ]);

  if (resultA.rows.length === 0 || resultB.rows.length === 0) {
    return res.json({ frases_a: [], frases_b: [] });
  }

  const frasesA = resultA.rows.map((r) => r.frase as string);
  const frasesB = resultB.rows.map((r) => r.frase as string);
  const embedsA = resultA.rows.map((r) => parseVector(r.embedding));
  const embedsB = resultB.rows.map((r) => parseVector(r.embedding));

  const matchedA = new Set<number>();
  const matchedB = new Set<number>();

  for (let i = 0; i < embedsA.length; i++) {
    for (let j = 0; j < embedsB.length; j++) {
      if (dot(embedsA[i], embedsB[j]) >= UMBRAL_FRASE) {
        matchedA.add(i);
        matchedB.add(j);
      }
    }
  }

  res.json({
    frases_a: [...matchedA].map((i) => frasesA[i]),
    frases_b: [...matchedB].map((j) => frasesB[j]),
  });
});

export default router;
