import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";

const router = Router();

// GET /api/admin/reset-demo
// Limpia todos los datos transaccionales y deja la DB en estado inicial para demo.
// Requiere token de administrador.
router.get("/reset-demo", requireAuth, requireRole("administrador"), async (_req, res) => {
  try {
    await query(`DELETE FROM retroalimentacion`);
    await query(`DELETE FROM solicitudes_equivalencia`); // CASCADE borra items_solicitud

    res.json({ ok: true, mensaje: "Demo reseteada. Sin solicitudes ni retroalimentacion. Historial y materias intactos." });
  } catch (err: any) {
    console.error("[reset-demo]", err);
    res.status(500).json({ error: err?.message || "error al resetear" });
  }
});

export default router;
