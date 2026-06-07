import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

interface Materia {
  id: number;
  nombre: string;
  cre: number;
  anio: number | null;
  horas_interaccion: number;
  horas_autonomo: number;
  contenido_texto: string;
}

interface Carrera {
  id: number;
  nombre: string;
  total_cre: number | null;
  universidad_nombre: string;
}

const ORDINAL = ["", "1°", "2°", "3°", "4°", "5°"];

export default function PlanCarrera() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [allCarrerasRes, materiasRes] = await Promise.all([
        api.get("/carreras").catch(() => ({ data: [] })),
        api.get(`/carreras/${id}/materias`),
      ]);
      const allCarreras: Carrera[] = allCarrerasRes.data;
      setCarrera(allCarreras.find((c) => c.id === Number(id)) ?? null);
      setMaterias(materiasRes.data);
      setLoading(false);
    })();
  }, [id]);

  function toggleMateria(materiaId: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(materiaId) ? next.delete(materiaId) : next.add(materiaId);
      return next;
    });
  }

  // Agrupar por año
  const porAnio = materias.reduce<Record<string, Materia[]>>((acc, m) => {
    const key = m.anio ? String(m.anio) : "Sin año";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const anios = Object.keys(porAnio).sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return na - nb;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Cargando plan de estudios…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/admin/carreras")}
          className="mt-1 text-slate-500 hover:text-slate-800 text-sm"
        >
          ← Carreras
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {carrera?.nombre ?? "Plan de Estudios"}
          </h1>
          {carrera?.universidad_nombre && (
            <p className="text-sm text-slate-500">{carrera.universidad_nombre}</p>
          )}
          {carrera?.total_cre && (
            <p className="text-sm text-slate-500">
              Total: {carrera.total_cre} créditos
            </p>
          )}
        </div>
      </div>

      {materias.length === 0 ? (
        <p className="text-sm text-slate-500 italic">
          Esta carrera no tiene materias cargadas.
        </p>
      ) : (
        anios.map((anio) => {
          const grupo = porAnio[anio];
          const totalCre = grupo.reduce((s, m) => s + (m.cre || 0), 0);
          const label =
            anio === "Sin año"
              ? "Sin año asignado"
              : `${ORDINAL[Number(anio)] ?? anio} Año`;

          return (
            <div key={anio} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Cabecera del año */}
              <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
                <span className="font-semibold">{label}</span>
                <span className="text-sm text-slate-300">
                  {grupo.length} materias · {totalCre} CRE
                </span>
              </div>

              {/* Lista de materias */}
              <div className="divide-y">
                {grupo.map((m) => {
                  const abierto = expandidos.has(m.id);
                  return (
                    <div key={m.id}>
                      <button
                        className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        onClick={() => toggleMateria(m.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className={`transition-transform text-slate-400 text-xs ${
                              abierto ? "rotate-90" : ""
                            }`}
                          >
                            ▶
                          </span>
                          <span className="font-medium truncate">{m.nombre}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500 ml-4 shrink-0">
                          <span className="font-semibold text-slate-700">
                            {m.cre} CRE
                          </span>
                          {m.horas_interaccion > 0 && (
                            <span>HIT: {m.horas_interaccion}h</span>
                          )}
                          {m.horas_autonomo > 0 && (
                            <span>HTAT: {m.horas_autonomo}h</span>
                          )}
                        </div>
                      </button>

                      {abierto && m.contenido_texto && (
                        <div className="px-12 py-4 bg-slate-50 border-t text-sm text-slate-700 leading-relaxed">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                            Contenidos mínimos
                          </p>
                          <p>{m.contenido_texto}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
