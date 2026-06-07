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
    `SELECT h.materia_id AS materia_origen_id, m2.id AS materia_destino_id,
            1 - (mo.embedding <=> m2.embedding) AS similitud
     FROM historial_academico h
     JOIN materias mo ON mo.id = h.materia_id
     JOIN materias m2 ON m2.carrera_id = $2
     WHERE h.usuario_id = $1`,
    [req.user!.id, carrera_destino_id]
  );

  res.json({ destino: destino.rows, origen: origen.rows, similitudes: similitudes.rows });
});

const UMBRAL_FRASE = 0.70;

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

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
