import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../auth";

interface Carrera { id: number; nombre: string; total_cre: number | null; universidad_id: number; universidad_nombre: string; }

export default function Carreras() {
  const { user } = useAuth();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [nombreCarr, setNombreCarr] = useState("");
  const [totalCre, setTotalCre] = useState("");

  async function reload() {
    if (!user?.universidad_id) return;
    const c = await api.get(`/carreras?universidad_id=${user.universidad_id}`);
    setCarreras(c.data);
  }
  useEffect(() => { reload(); }, [user?.universidad_id]);

  async function crearCarrera(e: FormEvent) {
    e.preventDefault();
    if (!user?.universidad_id || !nombreCarr.trim()) return;
    await api.post("/carreras", {
      universidad_id: user.universidad_id,
      nombre: nombreCarr.trim(),
      total_cre: totalCre ? Number(totalCre) : null,
    });
    setNombreCarr("");
    setTotalCre("");
    reload();
  }

  if (!user) return <div>Cargando…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Carreras de {user.nombre}</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">Mis carreras</h2>
        <ul className="space-y-1 mb-6 max-h-64 overflow-y-auto">
          {carreras.map((c) => (
            <li key={c.id} className="text-sm border-b py-1">
              <span className="font-medium">{c.nombre}</span>
              <span className="text-slate-500">{c.total_cre ? ` (${c.total_cre} CRE)` : ""}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={crearCarrera} className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">Crear nueva carrera</h3>
          <input
            value={nombreCarr}
            onChange={(e) => setNombreCarr(e.target.value)}
            placeholder="Nombre de la carrera"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <input
            value={totalCre}
            onChange={(e) => setTotalCre(e.target.value)}
            placeholder="Total CRE (opcional)"
            type="number"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-slate-900 text-white rounded px-3 py-2 text-sm">Crear</button>
        </form>
      </div>
    </div>
  );
}
