import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "./api";

export type Rol = "estudiante" | "evaluador" | "administrador";

export interface User {
  id: number;
  dni: string;
  nombre: string;
  rol: Rol;
  universidad_id: number | null;
  carrera_id: number | null;
  universidad_nombre: string | null;
  carrera_nombre: string | null;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (dni: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(dni: string, password: string): Promise<User> {
    const { data } = await api.post("/auth/login", { dni, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: Rol | Rol[] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8">Cargando…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.rol)) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
