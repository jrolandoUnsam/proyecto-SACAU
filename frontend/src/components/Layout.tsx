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
            CreditPath
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
                </>
              )}
              {user.rol === "evaluador" && (
                <NavLink to="/evaluador/cola" className={linkClass}>
                  Cola de solicitudes
                </NavLink>
              )}
              {user.rol === "administrador" && (
                <>
                  <NavLink to="/admin/carreras" className={linkClass}>
                    Carreras
                  </NavLink>
                  <NavLink to="/admin/materias" className={linkClass}>
                    Materias
                  </NavLink>
                </>
              )}
              <span className="text-sm text-slate-600 ml-3">
                {user.nombre} · <span className="italic">{user.rol}</span>
              </span>
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
