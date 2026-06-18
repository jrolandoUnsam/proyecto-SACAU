import { useEffect, useState } from "react";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface Solicitud {
  id: number;
  numero_tramite: string;
  estado: "pendiente" | "aprobada" | "aprobada_parcial" | "rechazada" | "cancelada";
  creada_en: string;
  resuelta_en: string | null;
  comentario_resolucion: string | null;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  carrera_origen_nombre: string | null;
  universidad_origen_nombre: string | null;
  total_items: number;
}

interface ItemDetalle {
  id: number;
  materia_origen_nombre: string;
  materia_destino_nombre: string;
  similitud: number;
  estado: "pendiente" | "aprobada" | "rechazada";
  comentario: string | null;
}

interface Detalle extends Solicitud {
  evaluador_nombre: string | null;
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
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  aprobada_parcial: "Aprobada parcialmente",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

export default function MisSolicitudes() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [comentarioCancelacion, setComentarioCancelacion] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/solicitudes/mis").then((r) => setItems(r.data));
  }, []);

  async function expandir(id: number) {
    if (open === id) { setOpen(null); setDetalle(null); return; }
    const { data } = await api.get(`/solicitudes/${id}`);
    setOpen(id);
    setDetalle(data);
  }

  function iniciarCancelacion(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setCancelando(id);
    setComentarioCancelacion("");
  }

  async function descargarComprobante(id: number, tramite: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDescargandoId(id);
    try {
      const { data } = await api.get(`/solicitudes/${id}/comprobante`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprobante-${tramite}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo descargar el comprobante.");
    } finally {
      setDescargandoId(null);
    }
  }

  async function confirmarCancelacion(id: number) {
    setCancelLoading(true);
    try {
      await api.patch(`/solicitudes/${id}/cancelar`, { comentario: comentarioCancelacion });
      setItems((prev) => prev.map((s) => s.id === id ? { ...s, estado: "cancelada" as const, comentario_resolucion: comentarioCancelacion || null } : s));
      if (open === id) { setOpen(null); setDetalle(null); }
      setCancelando(null);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis solicitudes</h1>
      {items.length === 0 && <p className="text-slate-500">Sin solicitudes todavía.</p>}
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() => expandir(s.id)}
              className="w-full text-left p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-slate-700">{s.numero_tramite}</span>
                    <span className="text-xs text-slate-400">Creada: {s.creada_en.slice(0, 10)}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {s.total_items} {Number(s.total_items) === 1 ? "materia" : "materias"}
                    </span>
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
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${s.estado === "pendiente" ? estadoColor.pendiente : s.estado === "cancelada" ? estadoColor.cancelada : s.estado === "rechazada" ? estadoColor.rechazada : estadoColor.aprobada}`}>
                    {s.estado === "pendiente" ? "Pendiente" : s.estado === "cancelada" ? "Cancelada" : s.estado === "rechazada" ? "Rechazada" : "Finalizada"}
                  </span>
                  {s.estado === "pendiente" && cancelando !== s.id && (
                    <button
                      onClick={(e) => iniciarCancelacion(s.id, e)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Cancelar solicitud
                    </button>
                  )}
                </div>
              </div>
            </button>

            {/* Panel de cancelación inline */}
            {cancelando === s.id && (
              <div className="border-t border-red-100 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800 mb-2">¿Cancelar la solicitud {s.numero_tramite}?</p>
                <textarea
                  value={comentarioCancelacion}
                  onChange={(e) => setComentarioCancelacion(e.target.value)}
                  placeholder="Motivo de la cancelación (opcional)"
                  rows={2}
                  className="w-full border border-red-200 rounded px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmarCancelacion(s.id)}
                    disabled={cancelLoading}
                    className="bg-red-600 text-white text-sm rounded px-4 py-1.5 hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelando…" : "Confirmar cancelación"}
                  </button>
                  <button
                    onClick={() => setCancelando(null)}
                    className="text-sm text-slate-600 hover:underline px-2"
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}
            {open === s.id && detalle && (
              <div className="border-t p-4">
                {(s.estado === "aprobada" || s.estado === "aprobada_parcial" || s.estado === "rechazada") && (
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={(e) => descargarComprobante(s.id, s.numero_tramite, e)}
                      disabled={descargandoId === s.id}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 text-white rounded px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {descargandoId === s.id ? "Descargando…" : "Descargar comprobante"}
                    </button>
                  </div>
                )}
                {detalle.evaluador_nombre && (
                  <div className="text-sm mb-2">
                    <b>Evaluador:</b> {detalle.evaluador_nombre}
                    {detalle.resuelta_en && <> · {detalle.resuelta_en.slice(0, 10)}</>}
                  </div>
                )}
                {detalle.comentario_resolucion && (
                  <div className="bg-slate-50 rounded p-3 text-sm mb-3">
                    <b>Comentario:</b> {detalle.comentario_resolucion}
                  </div>
                )}
                <div className="space-y-3">
                  {(() => {
                    const porDestino = new Map<string, ItemDetalle[]>();
                    for (const item of detalle.items) {
                      if (!porDestino.has(item.materia_destino_nombre))
                        porDestino.set(item.materia_destino_nombre, []);
                      porDestino.get(item.materia_destino_nombre)!.push(item);
                    }
                    return Array.from(porDestino.entries()).map(([destNombre, grupo]) => (
                      <div key={destNombre} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-700 text-sm">{destNombre}</span>
                          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${estadoColor[grupo[0].estado]}`}>
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
                              {item.comentario && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {item.comentario}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
