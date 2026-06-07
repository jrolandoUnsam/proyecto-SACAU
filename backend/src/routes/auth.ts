import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db";
import { requireAuth, signToken, AuthUser } from "../auth";

const router = Router();

router.post("/login", async (req, res) => {
  const { dni, password } = req.body as { dni?: string; password?: string };
  if (!dni || !password) return res.status(400).json({ error: "dni y contraseña requeridos" });
  const { rows } = await query<AuthUser & { password_hash: string }>(
    `SELECT u.id, u.dni, u.password_hash, u.nombre, u.rol,
            u.universidad_id, u.carrera_id,
            uni.nombre AS universidad_nombre, c.nombre AS carrera_nombre
     FROM usuarios u
     LEFT JOIN universidades uni ON uni.id = u.universidad_id
     LEFT JOIN carreras c ON c.id = u.carrera_id
     WHERE u.dni = $1`,
    [dni.trim()]
  );
  if (rows.length === 0) return res.status(401).json({ error: "DNI o contraseña incorrectos" });
  const { password_hash, ...user } = rows[0];
  const ok = await bcrypt.compare(password, password_hash);
  if (!ok) return res.status(401).json({ error: "DNI o contraseña incorrectos" });
  const token = signToken(user);
  res.json({ token, user });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
