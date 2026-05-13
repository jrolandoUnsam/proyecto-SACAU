import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface Universidad { id: number; nombre: string; }
interface Carrera { id: number; nombre: string; universidad_id: number; }

interface Preview {
  materia_origen_id: number;
  materia_origen_nombre: string;
  cre_origen: number;
  carrera_origen_nombre: string;
  universidad_origen_nombre: string;
  materia_destino_id: number;
  materia_destino_nombre: string;
  cre_destino: number;
  similitud: number;
}

export default function Solicitar() {
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [uniId, setUniId] = useState<number | "">("");
  const [carId, setCarId] = useState<number | "">("");
  const [preview, setPreview] = useState<Preview[] | null>(null);
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState<{ numero_tramite: string } | null>(null);

  useEffect(() => {
    api.get("/universidades").then((r) => setUniversidades(r.data));
  }, []);

  useEffect(() => {
    if (!uniId) { setCarreras([]); setCarId(""); return; }
    api.get(`/carreras?universidad_id=${uniId}`).then((r) => setCarreras(r.data));
  }, [uniId]);

  async function calcularPreview() {
    if (!carId) return;
    setLoading(true);
    setPreview(null);
    setEnviado(null);
    try {
      const { data } = await api.post("/equivalencias/preview", { carrera_destino_id: carId });
      setPreview(data);
      setSeleccion(new Set((data as Preview[]).filter((p) => p.similitud >= 0.5).map((p) => p.materia_origen_id)));
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: number) {
    const next = new Set(seleccion);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccion(next);
  }

  async function enviar() {
    if (!carId || !preview) return;
    const items = preview
      .filter((p) => seleccion.has(p.materia_origen_id))
      .map((p) => ({ materia_origen_id: p.materia_origen_id, materia_destino_id: p.materia_destino_id }));
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post("/solicitudes", { carrera_destino_id: carId, items });
      setEnviado({ numero_tramite: data.numero_tramite });
    } finally {
      setLoading(false);
    }
  }

  const totalSeleccionadas = seleccion.size;
  const promedioSim = useMemo(() => {
    if (!preview) return 0;
    const sel = preview.filter((p) => seleccion.has(p.materia_origen_id));
    if (sel.length === 0) return 0;
    return sel.reduce((s, p) => s + p.similitud, 0) / sel.length;
  }, [preview, seleccion]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Solicitar equivalencia</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">1. Elegir carrera destino</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label>
            <span className="text-sm">Universidad</span>
            <select
              value={uniId}
              onChange={(e) => setUniId(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
            >
              <option value="">— elegir —</option>
              {universidades.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm">Carrera</span>
            <select
              value={carId}
              onChange={(e) => setCarId(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              disabled={!uniId}
            >
              <option value="">— elegir —</option>
              {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={calcularPreview}
              disabled={!carId || loading}
              className="bg-slate-900 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Calculando…" : "Calcular equivalencias"}
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold mb-3">2. Revisar sugerencias</h2>
          {preview.length === 0 && <p className="text-slate-500">No hay materias en tu historial.</p>}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2"></th>
                <th className="py-2">Mi materia</th>
                <th className="py-2">Materia destino sugerida</th>
                <th className="py-2">Similitud</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p) => (
                <tr key={p.materia_origen_id} className="border-b last:border-0">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={seleccion.has(p.materia_origen_id)}
                      onChange={() => toggle(p.materia_origen_id)}
                    />
                  </td>
                  <td className="py-2">
                    <div className="font-medium">{p.materia_origen_nombre}</div>
                    <div className="text-xs text-slate-500">{p.universidad_origen_nombre} · {p.cre_origen} CRE</div>
                  </td>
                  <td className="py-2">
                    <div className="font-medium">{p.materia_destino_nombre}</div>
                    <div className="text-xs text-slate-500">{p.cre_destino} CRE</div>
                  </td>
                  <td className="py-2"><SimilitudBadge valor={Number(p.similitud)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div className="text-sm">
            Seleccionadas: <b>{totalSeleccionadas}</b> · Similitud promedio: <b>{(promedioSim * 100).toFixed(1)}%</b>
          </div>
          <button
            onClick={enviar}
            disabled={totalSeleccionadas === 0 || loading}
            className="bg-green-700 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            3. Enviar solicitud
          </button>
        </div>
      )}

      {enviado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-900 font-semibold">Solicitud enviada</div>
          <div className="text-sm text-green-800">
            Número de trámite: <b>{enviado.numero_tramite}</b>. La verás en "Mis solicitudes" con estado pendiente.
          </div>
        </div>
      )}
    </div>
  );
}
