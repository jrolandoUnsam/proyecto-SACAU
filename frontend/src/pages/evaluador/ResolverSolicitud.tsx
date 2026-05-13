import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface ItemDetalle {
  id: number;
  similitud: number;
  materia_origen_nombre: string;
  cre_origen: number;
  horas_int_origen: number | null;
  horas_aut_origen: number | null;
  contenido_origen: string;
  carrera_origen_nombre: string;
  universidad_origen_nombre: string;
  materia_destino_nombre: string;
  cre_destino: number;
  horas_int_destino: number | null;
  horas_aut_destino: number | null;
  contenido_destino: string;
}

interface Detalle {
  id: number;
  numero_tramite: string;
  estado: string;
  estudiante_nombre: string;
  estudiante_email: string;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  items: ItemDetalle[];
}

export default function ResolverSolicitud() {
  const { id } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState<Detalle | null>(null);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/solicitudes/${id}`).then((r) => setD(r.data));
  }, [id]);

  async function resolver(estado: "aprobada" | "rechazada") {
    if (!d) return;
    setSaving(true);
    setErr(null);
    try {
      await api.put(`/solicitudes/${d.id}`, { estado, comentario });
      nav("/evaluador/cola");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Error al resolver");
    } finally {
      setSaving(false);
    }
  }

  if (!d) return <div>Cargando…</div>;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Solicitud {d.numero_tramite}</h1>
        <div className="text-sm text-slate-600">
          {d.estudiante_nombre} ({d.estudiante_email}) → {d.universidad_destino_nombre} / {d.carrera_destino_nombre}
        </div>
      </div>

      <div className="space-y-4">
        {d.items.map((it) => (
          <div key={it.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-500">Similitud</div>
              <SimilitudBadge valor={Number(it.similitud)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <div className="text-xs text-slate-500 uppercase">Materia origen</div>
                <div className="font-semibold">{it.materia_origen_nombre}</div>
                <div className="text-xs text-slate-500 mb-2">
                  {it.universidad_origen_nombre} — {it.carrera_origen_nombre}
                </div>
                <div className="text-xs">
                  CRE <b>{it.cre_origen}</b> · Horas interacción <b>{it.horas_int_origen ?? "–"}</b> · Autónomo <b>{it.horas_aut_origen ?? "–"}</b>
                </div>
                <div className="mt-2 text-sm whitespace-pre-wrap line-clamp-[12] max-h-64 overflow-y-auto">
                  {it.contenido_origen}
                </div>
              </div>
              <div className="border rounded p-3 bg-slate-50">
                <div className="text-xs text-slate-500 uppercase">Materia destino</div>
                <div className="font-semibold">{it.materia_destino_nombre}</div>
                <div className="text-xs text-slate-500 mb-2">
                  {d.universidad_destino_nombre} — {d.carrera_destino_nombre}
                </div>
                <div className="text-xs">
                  CRE <b>{it.cre_destino}</b> · Horas interacción <b>{it.horas_int_destino ?? "–"}</b> · Autónomo <b>{it.horas_aut_destino ?? "–"}</b>
                </div>
                <div className="mt-2 text-sm whitespace-pre-wrap line-clamp-[12] max-h-64 overflow-y-auto">
                  {it.contenido_destino}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <label className="block mb-2">
          <span className="text-sm font-medium">Comentario (opcional)</span>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
            placeholder="Criterio aplicado…"
          />
        </label>
        {err && <div className="text-sm text-red-700 mb-2">{err}</div>}
        <div className="flex gap-2">
          <button
            onClick={() => resolver("aprobada")}
            disabled={saving}
            className="bg-green-700 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            onClick={() => resolver("rechazada")}
            disabled={saving}
            className="bg-red-700 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
