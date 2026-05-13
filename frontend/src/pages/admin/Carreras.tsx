import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";

interface Universidad { id: number; nombre: string; }
interface Carrera { id: number; nombre: string; total_cre: number | null; universidad_id: number; universidad_nombre: string; }

export default function Carreras() {
  const [unis, setUnis] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [nombreUni, setNombreUni] = useState("");
  const [carrUni, setCarrUni] = useState<number | "">("");
  const [nombreCarr, setNombreCarr] = useState("");
  const [totalCre, setTotalCre] = useState("");

  async function reload() {
    const [u, c] = await Promise.all([api.get("/universidades"), api.get("/carreras")]);
    setUnis(u.data);
    setCarreras(c.data);
  }
  useEffect(() => { reload(); }, []);

  async function crearUni(e: FormEvent) {
    e.preventDefault();
    if (!nombreUni.trim()) return;
    await api.post("/universidades", { nombre: nombreUni.trim() });
    setNombreUni("");
    reload();
  }

  async function crearCarrera(e: FormEvent) {
    e.preventDefault();
    if (!carrUni || !nombreCarr.trim()) return;
    await api.post("/carreras", {
      universidad_id: carrUni,
      nombre: nombreCarr.trim(),
      total_cre: totalCre ? Number(totalCre) : null,
    });
    setNombreCarr("");
    setTotalCre("");
    reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Universidades y carreras</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Universidades</h2>
          <ul className="space-y-1 mb-4">
            {unis.map((u) => <li key={u.id} className="text-sm border-b py-1">{u.nombre}</li>)}
          </ul>
          <form onSubmit={crearUni} className="flex gap-2">
            <input
              value={nombreUni}
              onChange={(e) => setNombreUni(e.target.value)}
              placeholder="Nueva universidad"
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <button type="submit" className="bg-slate-900 text-white px-3 rounded text-sm">+</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Carreras</h2>
          <ul className="space-y-1 mb-4 max-h-64 overflow-y-auto">
            {carreras.map((c) => (
              <li key={c.id} className="text-sm border-b py-1">
                <span className="font-medium">{c.nombre}</span>
                <span className="text-slate-500"> — {c.universidad_nombre}{c.total_cre ? ` (${c.total_cre} CRE)` : ""}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={crearCarrera} className="space-y-2">
            <select
              value={carrUni}
              onChange={(e) => setCarrUni(e.target.value ? Number(e.target.value) : "")}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="">— universidad —</option>
              {unis.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
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
    </div>
  );
}
