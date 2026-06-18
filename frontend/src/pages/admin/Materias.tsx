import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";

interface Carrera { id: number; nombre: string; universidad_nombre: string; universidad_id: number; }
interface Materia { id: number; nombre: string; cre: number; horas_interaccion: number | null; horas_autonomo: number | null; contenido_texto: string | null; }

export default function Materias() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<number | "">("");
  const [materias, setMaterias] = useState<Materia[]>([]);

  const [nombre, setNombre] = useState("");
  const [cre, setCre] = useState("");
  const [horasInt, setHorasInt] = useState("");
  const [horasAut, setHorasAut] = useState("");
  const [contenido, setContenido] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [parseBusy, setParseBusy] = useState(false);
  const [parseMsg, setParseMsg] = useState<string | null>(null);

  useEffect(() => {
    api.get("/carreras").then((r) => setCarreras(r.data));
  }, []);

  useEffect(() => {
    if (!carreraId) { setMaterias([]); return; }
    api.get(`/carreras/${carreraId}/materias`).then((r) => setMaterias(r.data));
  }, [carreraId]);

  async function parsePdf() {
    if (!pdf) return;
    setParseBusy(true);
    setParseMsg(null);
    try {
      const form = new FormData();
      form.append("pdf", pdf);
      const { data } = await api.post("/materias/parse-pdf", form, { headers: { "Content-Type": "multipart/form-data" } });
      setContenido(data.texto);
      setParseMsg("Contenido extraído por IA. Revisá y completá los demás campos antes de crear la materia.");
    } catch (e: any) {
      setParseMsg(e?.response?.data?.error || "Error al procesar el PDF");
    } finally {
      setParseBusy(false);
    }
  }

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (!carreraId || !nombre.trim() || !cre) return;
    setBusy(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("carrera_id", String(carreraId));
      form.append("nombre", nombre.trim());
      form.append("cre", cre);
      if (horasInt) form.append("horas_interaccion", horasInt);
      if (horasAut) form.append("horas_autonomo", horasAut);
      if (contenido.trim()) form.append("contenido_texto", contenido.trim());
      if (pdf) form.append("pdf", pdf);
      await api.post("/materias", form, { headers: { "Content-Type": "multipart/form-data" } });
      setNombre(""); setCre(""); setHorasInt(""); setHorasAut(""); setContenido(""); setPdf(null);
      const r = await api.get(`/carreras/${carreraId}/materias`);
      setMaterias(r.data);
      setMsg("Materia creada");
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Error al crear materia");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Materias por carrera</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block">
          <span className="text-sm">Carrera</span>
          <select
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
          >
            <option value="">— elegir —</option>
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>{c.universidad_nombre} — {c.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      {carreraId && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold mb-3">Materias existentes ({materias.length})</h2>
            <ul className="divide-y">
              {materias.map((m) => (
                <li key={m.id} className="py-2">
                  <div className="font-medium">{m.nombre}</div>
                  <div className="text-xs text-slate-500">
                    {m.cre} CRE · interacción {m.horas_interaccion ?? "–"}h · autónomo {m.horas_autonomo ?? "–"}h
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={crear} className="bg-white rounded-lg shadow p-4 space-y-3">
            <h2 className="font-semibold">Nueva materia</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre"
                className="border border-slate-300 rounded px-3 py-2 text-sm" required />
              <input value={cre} onChange={(e) => setCre(e.target.value)} placeholder="CRE" type="number"
                className="border border-slate-300 rounded px-3 py-2 text-sm" required />
              <input value={horasInt} onChange={(e) => setHorasInt(e.target.value)} placeholder="Horas interacción" type="number"
                className="border border-slate-300 rounded px-3 py-2 text-sm" />
              <input value={horasAut} onChange={(e) => setHorasAut(e.target.value)} placeholder="Horas autónomo" type="number"
                className="border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
              <p className="text-sm font-medium text-slate-700">Programa / contenido</p>
              <p className="text-xs text-slate-500">Subí el PDF del programa y la IA extrae el contenido, o escribilo manualmente.</p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => { setPdf(e.target.files?.[0] || null); setParseMsg(null); }}
                  className="text-sm text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white file:text-slate-700 file:border file:border-slate-300 hover:file:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={parsePdf}
                  disabled={!pdf || parseBusy}
                  className="flex items-center gap-2 bg-slate-900 text-white rounded px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {parseBusy && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {parseBusy ? "Procesando con IA…" : "Subir y procesar PDF"}
                </button>
              </div>
              {parseMsg && (
                <p className={`text-xs rounded px-2 py-1.5 ${parseMsg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {parseMsg}
                </p>
              )}
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="El contenido extraído del PDF aparecerá aquí, o escribilo manualmente"
                rows={5}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
              />
            </div>
            {msg && <div className="text-sm">{msg}</div>}
            <button type="submit" disabled={busy} className="bg-slate-900 text-white rounded px-4 py-2 disabled:opacity-50">
              {busy ? "Guardando (generando embedding)…" : "Crear materia"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
