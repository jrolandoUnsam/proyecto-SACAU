import { Router } from "express";
import { query } from "../db";
import { requireAuth, requireRole } from "../auth";
import { runSeed } from "../seed";

const router = Router();

// GET /api/admin/reset-demo
// Limpia todos los datos transaccionales y deja la DB en estado inicial para demo.
// Requiere token de administrador.
router.get("/reset-demo", requireAuth, requireRole("administrador"), async (_req, res) => {
  try {
    await query(`DELETE FROM retroalimentacion`);
    await query(`DELETE FROM solicitudes_equivalencia`); // CASCADE borra items_solicitud
    await query(`DELETE FROM historial_academico`);
    await query(
      `DELETE FROM carreras WHERE universidad_id = (
         SELECT id FROM universidades WHERE nombre = 'Universidad Nacional de Hurlingham'
       )`
    ); // CASCADE borra materias y materia_frases de UNAHUR

    // Re-corre el seed para restaurar datos base (Belgrano ya existe, UNAHUR sin carreras)
    await runSeed();

    res.json({ ok: true, mensaje: "Demo reseteada. UNAHUR sin carreras, sin historial ni solicitudes." });
  } catch (err: any) {
    console.error("[reset-demo]", err);
    res.status(500).json({ error: err?.message || "error al resetear" });
  }
});

export default router;
