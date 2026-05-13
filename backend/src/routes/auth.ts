import { Router } from "express";
import { query } from "../db";
import { requireAuth, signToken, AuthUser } from "../auth";

const router = Router();

router.post("/login", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "email requerido" });
  const { rows } = await query<AuthUser>(
    "SELECT id, email, nombre, rol, universidad_id, carrera_id FROM usuarios WHERE email = $1",
    [email.toLowerCase().trim()]
  );
  if (rows.length === 0) return res.status(404).json({ error: "usuario no encontrado" });
  const user = rows[0];
  const token = signToken(user);
  res.json({ token, user });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
