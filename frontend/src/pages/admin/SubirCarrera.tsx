import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../auth";

type UploadState = "idle" | "uploading" | "success" | "error";
type ManualState = "idle" | "saving" | "success" | "error";

export default function SubirCarrera() {
  const { user } = useAuth();

  // PDF upload
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual creation
  const [manualState, setManualState] = useState<ManualState>("idle");
  const [manualMsg, setManualMsg] = useState("");
  const [nombreCarrera, setNombreCarrera] = useState("");
  const [totalCre, setTotalCre] = useState("");

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadState("error");
      setUploadMsg("Seleccioná un archivo PDF primero.");
      return;
    }
    setUploadState("uploading");
    setUploadMsg("Extrayendo texto del PDF y procesando con IA...");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const { data } = await api.post("/carreras/upload-pdf", formData, { timeout: 300_000 });
      setUploadState("success");
      setUploadMsg(`Carrera "${data.carrera.nombre}" creada con ${data.materias_count} materias.`);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setUploadState("error");
      setUploadMsg(err?.response?.data?.error || err?.message || "Error desconocido");
    }
  }

  async function handleManual(e: FormEvent) {
    e.preventDefault();
    if (!nombreCarrera.trim() || !user?.universidad_id) return;
    setManualState("saving");
    setManualMsg("");
    try {
      const { data } = await api.post("/carreras", {
        universidad_id: user.universidad_id,
        nombre: nombreCarrera.trim(),
        total_cre: totalCre ? Number(totalCre) : undefined,
      });
      setManualState("success");
      setManualMsg(`Carrera "${data.nombre}" creada. Ahora podés agregar materias desde la sección Materias.`);
      setNombreCarrera("");
      setTotalCre("");
    } catch (err: any) {
      setManualState("error");
      setManualMsg(err?.response?.data?.error || "Error al crear la carrera");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agregar carrera</h1>

      {/* Opción 1: PDF */}
      <div className="bg-white rounded-lg shadow p-5 max-w-xl">
        <h2 className="font-semibold mb-1">Opción A — Subir PDF del plan de estudios</h2>
        <p className="text-sm text-slate-500 mb-4">
          El sistema extrae automáticamente las materias, años, créditos y contenidos.
        </p>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="block text-sm text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            onChange={(_e: ChangeEvent<HTMLInputElement>) => {
              if (uploadState !== "idle") { setUploadState("idle"); setUploadMsg(""); }
            }}
          />
          <button
            type="submit"
            disabled={uploadState === "uploading"}
            className="self-start bg-slate-900 text-white rounded px-4 py-2 text-sm disabled:opacity-60 flex items-center gap-2"
          >
            {uploadState === "uploading" && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {uploadState === "uploading" ? "Procesando…" : "Subir y procesar PDF"}
          </button>
          {uploadMsg && (
            <p className={`text-sm rounded px-3 py-2 ${uploadState === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {uploadMsg}
            </p>
          )}
        </form>
      </div>

      {/* Opción 2: Manual */}
      <div className="bg-white rounded-lg shadow p-5 max-w-xl">
        <h2 className="font-semibold mb-1">Opción B — Crear carrera manualmente</h2>
        <p className="text-sm text-slate-500 mb-4">
          Creá la carrera y luego agregá las materias una por una desde la sección <b>Materias</b>.
        </p>
        <form onSubmit={handleManual} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm text-slate-600 block mb-1">Nombre de la carrera</label>
              <input
                value={nombreCarrera}
                onChange={(e) => setNombreCarrera(e.target.value)}
                placeholder="Ej: Ingeniería en Sistemas"
                required
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Total CRE (opcional)</label>
              <input
                value={totalCre}
                onChange={(e) => setTotalCre(e.target.value)}
                type="number"
                placeholder="Ej: 240"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Universidad: <span className="font-medium text-slate-600">{user.universidad_nombre ?? "—"}</span>
          </div>
          <button
            type="submit"
            disabled={manualState === "saving" || !nombreCarrera.trim()}
            className="self-start bg-slate-900 text-white rounded px-4 py-2 text-sm disabled:opacity-60"
          >
            {manualState === "saving" ? "Guardando…" : "Crear carrera"}
          </button>
          {manualMsg && (
            <p className={`text-sm rounded px-3 py-2 ${manualState === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {manualMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
