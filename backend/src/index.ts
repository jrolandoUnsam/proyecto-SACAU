import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import universidadesRouter from "./routes/universidades";
import carrerasRouter from "./routes/carreras";
import materiasRouter from "./routes/materias";
import historialRouter from "./routes/historial";
import equivalenciasRouter from "./routes/equivalencias";
import solicitudesRouter from "./routes/solicitudes";
import perfilRouter from "./routes/perfil";
import { runSeed } from "./seed";
import { runMigrations } from "./migrate";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/universidades", universidadesRouter);
app.use("/api/carreras", carrerasRouter);
app.use("/api/materias", materiasRouter);
app.use("/api/historial", historialRouter);
app.use("/api/equivalencias", equivalenciasRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/perfil", perfilRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({ error: err?.message || "internal error" });
});

const port = Number(process.env.PORT || 4000);

app.listen(port, () => console.log(`[backend] Listening on ${port}`));

(async () => {
  try {
    await runMigrations();
    await runSeed();
  } catch (err) {
    console.error("[startup] error:", err);
  }
})();
