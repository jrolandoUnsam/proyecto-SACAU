import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

interface Solicitud {
  id: number;
  numero_tramite: string;
  creada_en: string;
  estudiante_nombre: string;
  estudiante_dni: string;
  carrera_origen_nombre: string | null;
  universidad_origen_nombre: string | null;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  total_items: number;
}

function TransferenciaCarrera({
  uniOrigen, carreraOrigen, uniDestino, carreraDestino,
}: {
  uniOrigen: string | null; carreraOrigen: string | null;
  uniDestino: string; carreraDestino: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-0.5">Origen</div>
        <div className="text-sm font-semibold text-blue-900 leading-tight">{uniOrigen ?? "—"}</div>
        <div className="text-xs text-blue-600 leading-tight">{carreraOrigen ?? "—"}</div>
      </div>
      <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
      <div className="bg-green-50 border border-green-200 rounded px-3 py-2 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-green-400 mb-0.5">Destino</div>
        <div className="text-sm font-semibold text-green-900 leading-tight">{uniDestino}</div>
        <div className="text-xs text-green-600 leading-tight">{carreraDestino}</div>
      </div>
    </div>
  );
}

export default function Cola() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/solicitudes/pendientes").then((r) => {
      setItems(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cola de solicitudes pendientes</h1>
      {items.length === 0 && <p className="text-slate-500">No hay solicitudes pendientes.</p>}
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm font-semibold text-slate-700">{s.numero_tramite}</span>
                  <span className="text-xs text-slate-400">{s.creada_en.slice(0, 10)}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {s.total_items} {Number(s.total_items) === 1 ? "materia" : "materias"}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800 mb-2">
                  {s.estudiante_nombre}
                  <span className="text-slate-400 font-normal ml-1">· DNI {s.estudiante_dni}</span>
                </div>
                <TransferenciaCarrera
                  uniOrigen={s.universidad_origen_nombre}
                  carreraOrigen={s.carrera_origen_nombre}
                  uniDestino={s.universidad_destino_nombre}
                  carreraDestino={s.carrera_destino_nombre}
                />
              </div>
              <Link
                to={`/evaluador/solicitud/${s.id}`}
                className="flex-shrink-0 bg-slate-900 text-white text-sm font-medium rounded px-4 py-2 hover:bg-slate-700 transition-colors"
              >
                Resolver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
