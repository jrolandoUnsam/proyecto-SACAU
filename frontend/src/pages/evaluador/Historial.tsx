import { useEffect, useState } from "react";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface Solicitud {
  id: number;
  numero_tramite: string;
  estado: "aprobada" | "aprobada_parcial" | "rechazada" | "cancelada";
  creada_en: string;
  resuelta_en: string | null;
  comentario_resolucion: string | null;
  estudiante_nombre: string;
  estudiante_dni: string;
  carrera_origen_nombre: string | null;
  universidad_origen_nombre: string | null;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  total_items: number;
}

interface ItemDetalle {
  id: number;
  estado: "pendiente" | "aprobada" | "aprobada_parcial" | "rechazada";
  comentario: string | null;
  similitud: number;
  materia_origen_nombre: string;
  materia_destino_nombre: string;
  anio_destino: number | null;
}

interface Detalle extends Solicitud {
  items: ItemDetalle[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  aprobada_parcial: "bg-blue-100 text-blue-800",
  rechazada: "bg-red-100 text-red-800",
  cancelada: "bg-slate-100 text-slate-500",
};

const estadoLabel: Record<string, string> = {
  aprobada: "Aprobada",
  aprobada_parcial: "Aprobada parcialmente",
  rechazada: "Rechazada",
  cancelada: "Cancelada por el alumno",
};

export default function Historial() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);

  useEffect(() => {
    api.get("/solicitudes/resueltas").then((r) => setItems(r.data));
  }, []);

  async function expandir(id: number) {
    if (open === id) { setOpen(null); setDetalle(null); return; }
    const { data } = await api.get(`/solicitudes/${id}`);
    setOpen(id);
    setDetalle(data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Historial de resoluciones</h1>
      {items.length === 0 && <p className="text-slate-500">Todavía no resolviste solicitudes.</p>}
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() => expandir(s.id)}
              className="w-full text-left p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-slate-700">{s.numero_tramite}</span>
                    {s.resuelta_en && <span className="text-xs text-slate-400">{s.resuelta_en.slice(0, 10)}</span>}
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {s.total_items} {Number(s.total_items) === 1 ? "materia" : "materias"}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-800 mb-2">
                    {s.estudiante_nombre}
                    <span className="text-slate-400 font-normal ml-1">· DNI {s.estudiante_dni}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">Origen</div>
                      <div className="text-xs font-semibold text-blue-900">{s.universidad_origen_nombre ?? "—"}</div>
                      <div className="text-xs text-blue-600">{s.carrera_origen_nombre ?? "—"}</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="bg-green-50 border border-green-200 rounded px-2 py-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-green-400">Destino</div>
                      <div className="text-xs font-semibold text-green-900">{s.universidad_destino_nombre}</div>
                      <div className="text-xs text-green-600">{s.carrera_destino_nombre}</div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
            {open === s.id && detalle && (
              <div className="border-t p-4 space-y-3">
                {detalle.comentario_resolucion && (
                  <div className="bg-slate-50 rounded p-3 text-sm">
                    <b>Comentario general:</b> {detalle.comentario_resolucion}
                  </div>
                )}
                {(() => {
                  const anioPorNum: Record<number, string> = { 1: "1.er año", 2: "2.° año", 3: "3.er año", 4: "4.° año", 5: "5.° año" };
                  const porAnio = new Map<number | null, ItemDetalle[]>();
                  for (const item of detalle.items) {
                    const key = item.anio_destino ?? null;
                    if (!porAnio.has(key)) porAnio.set(key, []);
                    porAnio.get(key)!.push(item);
                  }
                  const entradas = [...porAnio.entries()].sort(([a], [b]) => {
                    if (a === null) return 1;
                    if (b === null) return -1;
                    return a - b;
                  });
                  return entradas.map(([anio, itemsAnio]) => {
                    const porDestino = new Map<string, ItemDetalle[]>();
                    for (const item of itemsAnio) {
                      if (!porDestino.has(item.materia_destino_nombre))
                        porDestino.set(item.materia_destino_nombre, []);
                      porDestino.get(item.materia_destino_nombre)!.push(item);
                    }
                    return (
                      <div key={anio ?? "sin-anio"}>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-2 mb-2">
                          <span className="h-px flex-1 bg-slate-200" />
                          {anio !== null ? (anioPorNum[anio] ?? `${anio}.° año`) : "Sin año asignado"}
                          <span className="h-px flex-1 bg-slate-200" />
                        </h3>
                        <div className="space-y-2">
                          {Array.from(porDestino.entries()).map(([destNombre, grupo]) => (
                            <div key={destNombre} className="border border-slate-200 rounded-lg overflow-hidden">
                              <div className="bg-slate-50 px-4 py-2 flex items-start justify-between gap-3">
                                <div>
                                  <span className="font-semibold text-slate-700 text-sm">{destNombre}</span>
                                  {grupo[0].comentario && (
                                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {grupo[0].comentario}
                                    </div>
                                  )}
                                </div>
                                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${estadoColor[grupo[0].estado] ?? ""}`}>
                                  {estadoLabel[grupo[0].estado] ?? grupo[0].estado}
                                </span>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {grupo.map((item) => (
                                  <div key={item.id} className="px-4 py-2.5 text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="flex-1 text-slate-600">{item.materia_origen_nombre}</span>
                                      <SimilitudBadge valor={Number(item.similitud)} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
