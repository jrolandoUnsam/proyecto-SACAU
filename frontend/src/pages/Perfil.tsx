import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { api } from "../api";

const ROL_LABEL: Record<string, string> = {
  estudiante: "Estudiante",
  evaluador: "Evaluador",
  administrador: "Administrador",
};

const ROL_COLOR: Record<string, string> = {
  estudiante: "bg-blue-100 text-blue-800",
  evaluador: "bg-purple-100 text-purple-800",
  administrador: "bg-slate-100 text-slate-800",
};

interface Resumen {
  total_materias: number;
  total_cre: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
}

export default function Perfil() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    if (user?.rol === "estudiante") {
      api.get("/perfil/resumen").then((r) => setResumen(r.data)).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const dniMasked = user.dni.length > 4
    ? `${"•".repeat(user.dni.length - 4)}${user.dni.slice(-4)}`
    : user.dni;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Avatar + nombre */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 select-none">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-semibold">{user.nombre}</div>
            <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold ${ROL_COLOR[user.rol]}`}>
              {ROL_LABEL[user.rol]}
            </span>
          </div>
        </div>

        {/* Datos */}
        <dl className="divide-y divide-slate-100">
          <Row label="DNI" value={dniMasked} />
          {user.universidad_nombre && (
            <Row label="Universidad" value={user.universidad_nombre} />
          )}
          {user.carrera_nombre && (
            <Row label="Carrera" value={user.carrera_nombre} />
          )}
        </dl>
      </div>

      {/* Resumen académico — solo estudiantes */}
      {user.rol === "estudiante" && resumen && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Resumen académico
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Materias aprobadas" value={resumen.total_materias} />
            <Stat label="CRE acumulados" value={resumen.total_cre} />
            <Stat label="Solicitudes pendientes" value={resumen.solicitudes_pendientes} />
            <Stat label="Solicitudes aprobadas" value={resumen.solicitudes_aprobadas} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-3 flex justify-between text-sm">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="text-slate-800 font-medium text-right">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
