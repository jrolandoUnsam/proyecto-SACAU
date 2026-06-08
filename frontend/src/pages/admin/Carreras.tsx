import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";

interface Carrera {
  id: number;
  nombre: string;
  total_cre: number | null;
  universidad_id: number;
  universidad_nombre: string;
}

export default function Carreras() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.universidad_id) return;
    api
      .get(`/carreras?universidad_id=${user.universidad_id}`)
      .then((r) => setCarreras(r.data))
      .finally(() => setLoading(false));
  }, [user?.universidad_id]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Mis carreras — {user.universidad_nombre ?? user.nombre}
      </h1>

      <div className="bg-white rounded-lg shadow p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : carreras.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No hay carreras cargadas. Usá "Subir carrera" para agregar una.
          </p>
        ) : (
          <ul className="divide-y">
            {carreras.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{c.nombre}</span>
                  {c.total_cre && (
                    <span className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5">
                      {c.total_cre} CRE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/admin/plan/${c.id}`)}
                  className="text-sm text-slate-600 border border-slate-300 rounded px-3 py-1 hover:bg-slate-50"
                >
                  Ver plan de estudios
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
