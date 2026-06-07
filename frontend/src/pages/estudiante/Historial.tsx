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

function formatFecha(fecha: string): string {
  if (!fecha) return "";
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function agruparPorAnio(items: ItemHistorial[]): [string, ItemHistorial[]][] {
  const mapa = new Map<string, ItemHistorial[]>();
  for (const it of items) {
    const anio = it.fecha_aprobacion?.slice(0, 4) ?? "Sin fecha";
    if (!mapa.has(anio)) mapa.set(anio, []);
    mapa.get(anio)!.push(it);
  }
  const entradas = Array.from(mapa.entries()).sort(([a], [b]) => a.localeCompare(b));
  const ORDINALES = ["1°", "2°", "3°", "4°", "5°", "6°"];
  return entradas.map(([anio, materias], i) => [
    `${ORDINALES[i] ?? `${i + 1}°`} Año`,
    materias,
  ]);
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
  const grupos = agruparPorAnio(items);

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-2xl font-bold">Mi historial académico</h1>
        <div className="bg-white rounded-lg shadow px-4 py-2 text-right">
          <div className="text-xs text-slate-500">CRE acumulados</div>
          <div className="text-2xl font-bold">{totalCre}</div>
        </div>
      </div>

      {items.length === 0 && <p className="text-slate-500">Sin materias aprobadas todavía.</p>}

      <div className="space-y-8">
        {grupos.map(([anio, materias]) => {
          const creAnio = materias.reduce((s, i) => s + i.cre, 0);
          return (
            <div key={anio}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-700">{anio}</h2>
                <span className="text-sm text-slate-500">
                  {materias.length} {materias.length === 1 ? "materia" : "materias"} · <b>{creAnio} CRE</b>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materias.map((it) => (
                  <div key={it.id} className="bg-white rounded-lg shadow p-4">
                    <div className="font-semibold mb-2">{it.materia_nombre}</div>
                    <div className="flex gap-4 text-sm">
                      <div>CRE: <b>{it.cre}</b></div>
                      <div>Nota: <b>{Number(it.nota).toFixed(0)}</b></div>
                      <div>Aprobada: <b>{formatFecha(it.fecha_aprobacion)}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
