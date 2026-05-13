import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

router.get("/", async (req, res) => {
  const universidadId = req.query.universidad_id ? Number(req.query.universidad_id) : null;
  const { rows } = universidadId
    ? await query(
        `SELECT c.id, c.nombre, c.total_cre, c.universidad_id, u.nombre AS universidad_nombre
         FROM carreras c JOIN universidades u ON u.id = c.universidad_id
         WHERE c.universidad_id = $1 ORDER BY c.nombre`,
        [universidadId]
      )
    : await query(
        `SELECT c.id, c.nombre, c.total_cre, c.universidad_id, u.nombre AS universidad_nombre
         FROM carreras c JOIN universidades u ON u.id = c.universidad_id ORDER BY u.nombre, c.nombre`
      );
  res.json(rows);
});

router.get("/:id/materias", async (req, res) => {
  const { rows } = await query(
    `SELECT id, nombre, cre, horas_interaccion, horas_autonomo, contenido_texto
     FROM materias WHERE carrera_id = $1 ORDER BY nombre`,
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

export default router;
