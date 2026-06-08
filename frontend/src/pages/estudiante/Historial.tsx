import { useEffect, useState } from "react";
import { api } from "../../api";

interface HistorialRaw {
  id: number;
  materia_nombre: string;
  cre: number;
  nota: number;
  fecha_aprobacion: string;
  carrera_nombre: string;
  universidad_nombre: string;
}

interface EquivalenciaItem {
  item_id: number;
  estado: "aprobada" | "aprobada_parcial";
  comentario: string | null;
  nota: number | null;
  materia_destino_nombre: string;
  materia_destino_cre: number;
  materia_origen_nombre: string;
}

interface Equivalencia {
  solicitud_id: number;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  items: EquivalenciaItem[];
}

interface Materia {
  key: string;
  nombre: string;
  cre: number;
  nota: number | null;
  fecha: string | null;
  tipo: "examen" | "equivalencia";
  origen?: string; // materia de origen (solo equivalencias)
  comentario?: string | null;
  estado?: "aprobada" | "aprobada_parcial";
}

interface UnivGroup {
  universidad: string;
  carrera: string;
  materias: Materia[];
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export default function Historial() {
  const [grupos, setGrupos] = useState<UnivGroup[]>([]);
  const [seleccionado, setSeleccionado] = useState<UnivGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<HistorialRaw[]>("/historial"),
      api.get<Equivalencia[]>("/solicitudes/mis-aprobadas"),
    ]).then(([h, e]) => {
      const map = new Map<string, UnivGroup>();

      for (const it of h.data) {
        const key = `${it.universidad_nombre}||${it.carrera_nombre}`;
        if (!map.has(key)) map.set(key, { universidad: it.universidad_nombre, carrera: it.carrera_nombre, materias: [] });
        map.get(key)!.materias.push({
          key: `h-${it.id}`,
          nombre: it.materia_nombre,
          cre: it.cre,
          nota: Number(it.nota),
          fecha: it.fecha_aprobacion,
          tipo: "examen",
        });
      }

      for (const eq of e.data) {
        const key = `${eq.universidad_destino_nombre}||${eq.carrera_destino_nombre}`;
        if (!map.has(key)) map.set(key, { universidad: eq.universidad_destino_nombre, carrera: eq.carrera_destino_nombre, materias: [] });
        for (const item of eq.items) {
          map.get(key)!.materias.push({
            key: `eq-${item.item_id}`,
            nombre: item.materia_destino_nombre,
            cre: item.materia_destino_cre,
            nota: item.nota != null ? Number(item.nota) : null,
            fecha: null,
            tipo: "equivalencia",
            origen: item.materia_origen_nombre,
            comentario: item.comentario,
            estado: item.estado,
          });
        }
      }

      setGrupos(Array.from(map.values()));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-slate-500 py-4">Cargando…</div>;

  /* ── Vista detalle ── */
  if (seleccionado) {
    const totalCre = seleccionado.materias.reduce((s, m) => s + (m.cre ?? 0), 0);
    return (
      <div>
        <button
          onClick={() => setSeleccionado(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">{seleccionado.universidad}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{seleccionado.carrera}</p>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-2 text-right">
            <div className="text-xs text-slate-500">CRE acumulados</div>
            <div className="text-2xl font-bold">{totalCre}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium">Materia</th>
                <th className="text-center px-4 py-3 font-medium">Créd.</th>
                <th className="text-center px-4 py-3 font-medium">Nota</th>
                <th className="text-center px-4 py-3 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {seleccionado.materias.map((m) => (
                <tr key={m.key} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{m.nombre}</div>
                    {m.tipo === "equivalencia" && m.origen && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Desde: <span className="italic">{m.origen}</span>
                      </div>
                    )}
                    {m.comentario && (
                      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1 mt-1">
                        {m.comentario}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{m.cre}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                    {m.nota !== null ? m.nota : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.tipo === "examen" ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                        Examen final
                      </span>
                    ) : m.estado === "aprobada" ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                        Equivalencia
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        Equiv. parcial
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {formatFecha(m.fecha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── Vista lista de universidades ── */
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mi historial académico</h1>

      {grupos.length === 0 && (
        <p className="text-slate-500">Sin materias aprobadas todavía.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grupos.map((g) => {
          const totalCre = g.materias.reduce((s, m) => s + (m.cre ?? 0), 0);
          const tieneEquiv = g.materias.some((m) => m.tipo === "equivalencia");
          const tieneExamen = g.materias.some((m) => m.tipo === "examen");
          return (
            <button
              key={`${g.universidad}||${g.carrera}`}
              onClick={() => setSeleccionado(g)}
              className="bg-white rounded-xl shadow hover:shadow-md transition-shadow text-left p-5 group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {g.universidad}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{g.carrera}</p>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span><b>{g.materias.length}</b> {g.materias.length === 1 ? "materia" : "materias"}</span>
                <span className="text-slate-300">·</span>
                <span><b>{totalCre}</b> CRE</span>
              </div>
              {(tieneExamen || tieneEquiv) && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {tieneExamen && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                      Examen final
                    </span>
                  )}
                  {tieneEquiv && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      Equivalencia
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
