import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../auth";

const linkBase = "px-3 py-2 rounded-md text-sm font-medium";
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`;

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            SUCU
          </Link>
          {user && (
            <nav className="flex items-center gap-2">
              {user.rol === "estudiante" && (
                <>
                  <NavLink to="/estudiante/historial" className={linkClass}>
                    Mi historial
                  </NavLink>
                  <NavLink to="/estudiante/solicitar" className={linkClass}>
                    Solicitar equivalencia
                  </NavLink>
                  <NavLink to="/estudiante/solicitudes" className={linkClass}>
                    Mis solicitudes
                  </NavLink>
                  <NavLink to="/plan-estudios" className={linkClass}>
                    Plan de Estudios
                  </NavLink>
                </>
              )}
              {user.rol === "evaluador" && (
                <>
                  <NavLink to="/evaluador/cola" className={linkClass}>
                    Cola de solicitudes
                  </NavLink>
                  <NavLink to="/evaluador/historial" className={linkClass}>
                    Historial
                  </NavLink>
                </>
              )}
              {user.rol === "administrador" && (
                <>
                  <NavLink to="/admin/carreras" className={linkClass}>
                    Mis carreras
                  </NavLink>
                  <NavLink to="/admin/subir-carrera" className={linkClass}>
                    Subir carrera
                  </NavLink>
                </>
              )}
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `ml-3 text-sm text-slate-600 hover:text-slate-900 hover:underline leading-tight text-right ${isActive ? "font-semibold" : ""}`
                }
              >
                <span className="block font-medium">{user.nombre}</span>
                {(user.universidad_nombre || user.carrera_nombre) && (
                  <span className="block text-xs text-slate-400">
                    {[user.carrera_nombre, user.universidad_nombre].filter(Boolean).join(" · ")}
                  </span>
                )}
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  nav("/login");
                }}
                className="ml-2 text-sm text-red-700 hover:underline"
              >
                Cerrar sesión
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
