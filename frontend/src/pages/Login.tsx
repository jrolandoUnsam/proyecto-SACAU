import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const DEMO = [
  { dni: "42000003", pass: "ana123", label: "Ana Estudiante (UNAHUR)" },
  { dni: "28000002", pass: "eval123", label: "Carlos Evaluador (UNAHUR)" },
  { dni: "30000002", pass: "admin123", label: "Admin UNAHUR" },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login(dni, password);
      if (user.rol === "estudiante") nav("/estudiante/historial");
      else if (user.rol === "evaluador") nav("/evaluador/cola");
      else nav("/admin/carreras");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Error de login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">SUCU</h1>
        <p className="text-sm text-slate-500 mb-6">Ingresá con tu DNI y contraseña</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">DNI</span>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              placeholder="Sin puntos"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              required
            />
          </label>
          {err && <div className="text-sm text-red-700">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded py-2 font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-slate-400 mb-2">Usuarios demo (clic para autocompletar):</p>
          <div className="space-y-1">
            {DEMO.map((d) => (
              <button
                key={d.dni}
                type="button"
                onClick={() => { setDni(d.dni); setPassword(d.pass); }}
                className="block w-full text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded px-2 py-1"
              >
                {d.label} — DNI {d.dni} / {d.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
