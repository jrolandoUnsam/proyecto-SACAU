import { useEffect, useState } from "react";
import { api } from "../../api";

interface ItemHistorial {
  id: number;
  materia_nombre: string;
  cre: number;
  nota: number;
  fecha_aprobacion: string;
  carrera_nombre: string;
  universidad_nombre: string;
}

export default function Historial() {
  const [items, setItems] = useState<ItemHistorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/historial").then((r) => {
      setItems(r.data);
      setLoading(false);
    });
  }, []);

  const totalCre = items.reduce((s, i) => s + i.cre, 0);

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl font-bold">Mi historial académico</h1>
        <div className="bg-white rounded-lg shadow px-4 py-2">
          <div className="text-xs text-slate-500">CRE acumulados</div>
          <div className="text-2xl font-bold">{totalCre}</div>
        </div>
      </div>
      {items.length === 0 && <p className="text-slate-500">Sin materias aprobadas todavía.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold">{it.materia_nombre}</div>
            <div className="text-sm text-slate-500">
              {it.universidad_nombre} — {it.carrera_nombre}
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <div>CRE: <b>{it.cre}</b></div>
              <div>Nota: <b>{Number(it.nota).toFixed(2)}</b></div>
              <div>Fecha: <b>{it.fecha_aprobacion?.slice(0, 10)}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
