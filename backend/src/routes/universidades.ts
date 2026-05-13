import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await query("SELECT id, nombre FROM universidades ORDER BY nombre");
  res.json(rows);
});

router.post("/", requireAuth, requireRole("administrador"), async (req, res) => {
  const { nombre } = req.body as { nombre?: string };
  if (!nombre) return res.status(400).json({ error: "nombre requerido" });
  const { rows } = await query(
    "INSERT INTO universidades (nombre) VALUES ($1) RETURNING id, nombre",
    [nombre.trim()]
  );
  res.status(201).json(rows[0]);
});

export default router;
