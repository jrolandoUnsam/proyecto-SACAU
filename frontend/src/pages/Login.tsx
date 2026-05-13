import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const DEMO = [
  { email: "ana@unstech.edu.ar", label: "Ana Estudiante (estudiante)" },
  { email: "evaluador@litoral.edu.ar", label: "Carlos Evaluador (evaluador)" },
  { email: "admin@creditpath.ar", label: "Lucía Admin (administrador)" },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(DEMO[0].email);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login(email);
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
        <h1 className="text-2xl font-bold mb-1">CreditPath</h1>
        <p className="text-sm text-slate-500 mb-6">Mock OAuth — Login simulado SIU</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Usuario demo</span>
            <select
              value={DEMO.find((d) => d.email === email) ? email : ""}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
            >
              <option value="">— elegir o escribir email abajo —</option>
              {DEMO.map((d) => (
                <option key={d.email} value={d.email}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
      </div>
    </div>
  );
}
