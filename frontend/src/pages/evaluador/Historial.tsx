import { useEffect, useState } from "react";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface Solicitud {
  id: number;
  numero_tramite: string;
  estado: "aprobada" | "aprobada_parcial" | "rechazada";
  creada_en: string;
  resuelta_en: string | null;
  comentario_resolucion: string | null;
  estudiante_nombre: string;
  estudiante_dni: string;
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
}

interface Detalle extends Solicitud {
  items: ItemDetalle[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  aprobada_parcial: "bg-blue-100 text-blue-800",
  rechazada: "bg-red-100 text-red-800",
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
              className="w-full text-left p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{s.numero_tramite}</div>
                <div className="text-sm text-slate-500">
                  {s.estudiante_nombre} (DNI {s.estudiante_dni}) · {s.universidad_destino_nombre} — {s.carrera_destino_nombre} · {s.total_items} materias
                </div>
                {s.resuelta_en && (
                  <div className="text-xs text-slate-400">Resuelta: {s.resuelta_en.slice(0, 10)}</div>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[s.estado] ?? ""}`}>
                {{ aprobada: "Aprobada", aprobada_parcial: "Aprobada parcialmente", rechazada: "Rechazada" }[s.estado] ?? s.estado}
              </span>
            </button>
            {open === s.id && detalle && (
              <div className="border-t p-4">
                {detalle.comentario_resolucion && (
                  <div className="bg-slate-50 rounded p-3 text-sm mb-3">
                    <b>Comentario general:</b> {detalle.comentario_resolucion}
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2">Materia origen</th>
                      <th className="py-2">Materia destino</th>
                      <th className="py-2">Similitud</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2">Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items.map((i) => (
                      <tr key={i.id} className="border-b last:border-0 align-top">
                        <td className="py-2">{i.materia_origen_nombre}</td>
                        <td className="py-2">{i.materia_destino_nombre}</td>
                        <td className="py-2"><SimilitudBadge valor={Number(i.similitud)} /></td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[i.estado]}`}>
                            {i.estado}
                          </span>
                        </td>
                        <td className="py-2 text-slate-600">{i.comentario || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
