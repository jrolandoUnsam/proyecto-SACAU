import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../auth";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function SubirCarrera() {
  const { user } = useAuth();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      const { data } = await api.post("/carreras/upload-pdf", formData, {
        timeout: 300_000,
      });
      setUploadState("success");
      setUploadMsg(
        `Carrera "${data.carrera.nombre}" creada con ${data.materias_count} materias.`
      );
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setUploadState("error");
      const msg =
        err?.response?.data?.error || err?.message || "Error desconocido";
      setUploadMsg(msg);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subir carrera</h1>

      <div className="bg-white rounded-lg shadow p-5 max-w-xl">
        <p className="text-sm text-slate-500 mb-4">
          Subí el PDF del plan de estudios y el sistema extrae automáticamente
          las materias, años, créditos y contenidos.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="block text-sm text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            onChange={(_e: ChangeEvent<HTMLInputElement>) => {
              if (uploadState !== "idle") {
                setUploadState("idle");
                setUploadMsg("");
              }
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
            <p
              className={`text-sm rounded px-3 py-2 ${
                uploadState === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {uploadMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
