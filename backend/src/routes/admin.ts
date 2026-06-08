import { Router } from "express";
import { query } from "../db";

const router = Router();

router.get("/reset-demo", async (req, res) => {
  if (req.query.key !== "sacau2026") return res.status(403).json({ error: "clave incorrecta" });
  try {
    await query(`DELETE FROM retroalimentacion`);
    await query(`DELETE FROM solicitudes_equivalencia`); // CASCADE borra items_solicitud
    await query(`
      DELETE FROM carreras
      WHERE universidad_id = (SELECT id FROM universidades WHERE nombre = 'Universidad Nacional de Hurlingham')
    `); // CASCADE borra materias, materia_frases e historial de Ana

    res.json({ ok: true, mensaje: "Demo reseteada. Subi el PDF de UNAHUR para arrancar." });
  } catch (err: any) {
    console.error("[reset-demo]", err);
    res.status(500).json({ error: err?.message || "error al resetear" });
  }
});

export default router;
