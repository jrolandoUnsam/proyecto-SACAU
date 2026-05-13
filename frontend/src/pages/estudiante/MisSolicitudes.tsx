import { useEffect, useState } from "react";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface Solicitud {
  id: number;
  numero_tramite: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  creada_en: string;
  resuelta_en: string | null;
  comentario_resolucion: string | null;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  total_items: number;
}

interface ItemDetalle {
  id: number;
  materia_origen_nombre: string;
  materia_destino_nombre: string;
  similitud: number;
}

interface Detalle extends Solicitud {
  evaluador_nombre: string | null;
  items: ItemDetalle[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

export default function MisSolicitudes() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<Detalle | null>(null);

  useEffect(() => {
    api.get("/solicitudes/mis").then((r) => setItems(r.data));
  }, []);

  async function expandir(id: number) {
    if (open === id) { setOpen(null); setDetalle(null); return; }
    const { data } = await api.get(`/solicitudes/${id}`);
    setOpen(id);
    setDetalle(data);
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
              className="w-full text-left p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{s.numero_tramite}</div>
                <div className="text-sm text-slate-500">
                  {s.universidad_destino_nombre} — {s.carrera_destino_nombre} · {s.total_items} materias
                </div>
                <div className="text-xs text-slate-400">Creada: {s.creada_en.slice(0, 10)}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[s.estado]}`}>
                {s.estado}
              </span>
            </button>
            {open === s.id && detalle && (
              <div className="border-t p-4">
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2">Mi materia</th>
                      <th className="py-2">Materia destino</th>
                      <th className="py-2">Similitud</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items.map((i) => (
                      <tr key={i.id} className="border-b last:border-0">
                        <td className="py-2">{i.materia_origen_nombre}</td>
                        <td className="py-2">{i.materia_destino_nombre}</td>
                        <td className="py-2"><SimilitudBadge valor={Number(i.similitud)} /></td>
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
