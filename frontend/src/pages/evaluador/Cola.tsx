import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

interface Solicitud {
  id: number;
  numero_tramite: string;
  creada_en: string;
  estudiante_nombre: string;
  estudiante_email: string;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  total_items: number;
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Trámite</th>
              <th className="p-3">Estudiante</th>
              <th className="p-3">Carrera destino</th>
              <th className="p-3">Materias</th>
              <th className="p-3">Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-mono">{s.numero_tramite}</td>
                <td className="p-3">
                  <div>{s.estudiante_nombre}</div>
                  <div className="text-xs text-slate-500">{s.estudiante_email}</div>
                </td>
                <td className="p-3">
                  <div>{s.carrera_destino_nombre}</div>
                  <div className="text-xs text-slate-500">{s.universidad_destino_nombre}</div>
                </td>
                <td className="p-3">{s.total_items}</td>
                <td className="p-3">{s.creada_en.slice(0, 10)}</td>
                <td className="p-3">
                  <Link to={`/evaluador/solicitud/${s.id}`} className="text-blue-700 hover:underline">
                    Resolver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
