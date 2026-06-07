import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";
import { resaltar, terminosCompartidos } from "../../lib/contenido";
import type { Segmento } from "../../lib/contenido";

interface ItemDetalle {
  id: number;
  similitud: number;
  estado: "pendiente" | "aprobada" | "aprobada_parcial" | "rechazada";
  comentario: string | null;
  materia_origen_id: number;
  materia_origen_nombre: string;
  cre_origen: number;
  horas_int_origen: number | null;
  horas_aut_origen: number | null;
  contenido_origen: string;
  carrera_origen_nombre: string;
  universidad_origen_nombre: string;
  materia_destino_id: number;
  materia_destino_nombre: string;
  cre_destino: number;
  horas_int_destino: number | null;
  horas_aut_destino: number | null;
  contenido_destino: string;
}

interface Detalle {
  id: number;
  numero_tramite: string;
  estado: string;
  estudiante_nombre: string;
  estudiante_dni: string;
  carrera_destino_nombre: string;
  universidad_destino_nombre: string;
  comentario_resolucion: string | null;
  items: ItemDetalle[];
}

interface Bloque {
  destinoId: number;
  destinoNombre: string;
  creDestino: number;
  horasIntDestino: number | null;
  horasAutDestino: number | null;
  items: ItemDetalle[];
}

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  aprobada_parcial: "bg-blue-100 text-blue-800",
  rechazada: "bg-red-100 text-red-800",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  aprobada_parcial: "Aprobada parcialmente",
  rechazada: "Rechazada",
};

function TextoResaltado({ texto, compartidos }: { texto: string; compartidos: Set<string> }) {
  const segs: Segmento[] = resaltar(texto, compartidos);
  return (
    <>
      {segs.map((s, i) =>
        s.hit ? (
          <mark key={i} className="bg-yellow-200 font-semibold rounded px-0.5">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

export default function ResolverSolicitud() {
  const { id } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState<Detalle | null>(null);
  // decision[destinoId] = "aprobada" | "rechazada"
  const [decision, setDecision] = useState<Record<number, "aprobada" | "rechazada">>({});
  const [comentario, setComentario] = useState("");
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/solicitudes/${id}`).then((r) => setD(r.data));
  }, [id]);

  const bloques = useMemo<Bloque[]>(() => {
    if (!d) return [];
    const map = new Map<number, Bloque>();
    for (const it of d.items) {
      if (!map.has(it.materia_destino_id)) {
        map.set(it.materia_destino_id, {
          destinoId: it.materia_destino_id,
          destinoNombre: it.materia_destino_nombre,
          creDestino: it.cre_destino,
          horasIntDestino: it.horas_int_destino,
          horasAutDestino: it.horas_aut_destino,
          items: [],
        });
      }
      map.get(it.materia_destino_id)!.items.push(it);
    }
    return [...map.values()];
  }, [d]);

  function toggle(destinoId: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(destinoId) ? next.delete(destinoId) : next.add(destinoId);
      return next;
    });
  }

  async function resolver() {
    if (!d) return;

    // Verificar que todos los bloques tienen decisión
    const sinDecision = bloques.find((b) => !decision[b.destinoId]);
    if (sinDecision) {
      setErr(`Falta decidir: ${sinDecision.destinoNombre}`);
      return;
    }

    // Armar items_estado: cada item hereda la decisión de su bloque destino
    const items_estado: Record<string, "aprobada" | "rechazada"> = {};
    for (const bloque of bloques) {
      const dec = decision[bloque.destinoId]!;
      for (const item of bloque.items) {
        items_estado[item.id] = dec;
      }
    }

    setSaving(true);
    setErr(null);
    try {
      await api.put(`/solicitudes/${d.id}`, { items_estado, comentario: comentario.trim() || undefined });
      nav("/evaluador/cola");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Error al resolver la solicitud");
    } finally {
      setSaving(false);
    }
  }

  if (!d) return <div className="p-4 text-slate-500">Cargando…</div>;

  const yaCerrada = d.estado !== "pendiente";
  const todosResueltos = bloques.length > 0 && bloques.every((b) => decision[b.destinoId]);

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Solicitud {d.numero_tramite}</h1>
        <div className="text-sm text-slate-600 mt-1">
          {d.estudiante_nombre}
          {d.estudiante_dni ? ` (DNI ${d.estudiante_dni})` : ""} →{" "}
          {d.universidad_destino_nombre} / {d.carrera_destino_nombre}
        </div>
        {yaCerrada && (
          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${estadoColor[d.estado] ?? ""}`}>
            {estadoLabel[d.estado] ?? d.estado}
          </span>
        )}
        {yaCerrada && d.comentario_resolucion && (
          <div className="mt-2 text-sm bg-slate-50 rounded p-3">
            <b>Comentario:</b> {d.comentario_resolucion}
          </div>
        )}
      </div>

      {/* Bloques por materia destino */}
      <div className="space-y-4">
        {bloques.map((bloque) => {
          const abierto = expandidos.has(bloque.destinoId);
          const dec = decision[bloque.destinoId];
          const bestSim = Math.max(...bloque.items.map((it) => Number(it.similitud)));
          // Cuando ya está cerrada, tomar el estado del primer item del bloque
          const estadoBloque = yaCerrada ? bloque.items[0]?.estado : undefined;

          return (
            <div key={bloque.destinoId} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Cabecera clickeable */}
              <div
                className="flex items-start justify-between p-4 cursor-pointer select-none hover:bg-slate-50"
                onClick={() => toggle(bloque.destinoId)}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-semibold">{bloque.destinoNombre}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {bloque.creDestino} CRE ·{" "}
                    {bloque.items.length === 1
                      ? `propuesta: ${bloque.items[0].materia_origen_nombre} (${bloque.items[0].universidad_origen_nombre})`
                      : `${bloque.items.length} materias propuestas: ${bloque.items.map((it) => it.materia_origen_nombre).join(", ")}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {estadoBloque && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[estadoBloque] ?? ""}`}>
                      {estadoLabel[estadoBloque] ?? estadoBloque}
                    </span>
                  )}
                  {dec && !yaCerrada && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[dec]}`}>
                      {estadoLabel[dec]}
                    </span>
                  )}
                  <SimilitudBadge valor={bestSim} />
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Contenido expandido */}
              {abierto && (
                <div className="border-t p-4 space-y-4">
                  {bloque.items.map((it) => {
                    const compartidos = terminosCompartidos(it.contenido_destino, it.contenido_origen);
                    return (
                      <div key={it.id}>
                        <div className="text-xs text-slate-500 uppercase mb-2 font-medium">
                          {it.materia_origen_nombre}
                          <span className="text-slate-400"> — {it.universidad_origen_nombre} · {it.carrera_origen_nombre}</span>
                          <span className="ml-2 normal-case font-normal">
                            CRE {it.cre_origen} · <SimilitudBadge valor={Number(it.similitud)} />
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="border rounded p-3 bg-slate-50">
                            <div className="text-xs text-slate-500 mb-1 font-medium uppercase">
                              Destino — {bloque.destinoNombre}
                            </div>
                            <div className="text-xs text-slate-400 mb-2">
                              {bloque.creDestino} CRE
                              {bloque.horasIntDestino != null && ` · ${bloque.horasIntDestino}h interacción`}
                              {bloque.horasAutDestino != null && ` · ${bloque.horasAutDestino}h autónomo`}
                            </div>
                            <p className="text-sm leading-relaxed">
                              <TextoResaltado texto={it.contenido_destino} compartidos={compartidos} />
                            </p>
                          </div>
                          <div className="border rounded p-3">
                            <div className="text-xs text-slate-500 mb-1 font-medium uppercase">
                              Origen — {it.materia_origen_nombre}
                            </div>
                            <div className="text-xs text-slate-400 mb-2">
                              {it.cre_origen} CRE
                              {it.horas_int_origen != null && ` · ${it.horas_int_origen}h interacción`}
                              {it.horas_aut_origen != null && ` · ${it.horas_aut_origen}h autónomo`}
                            </div>
                            <p className="text-sm leading-relaxed">
                              <TextoResaltado texto={it.contenido_origen} compartidos={compartidos} />
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Decisión por bloque — solo cuando está pendiente */}
                  {!yaCerrada && (
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDecision((p) => ({ ...p, [bloque.destinoId]: "aprobada" })); }}
                        className={`rounded px-4 py-1.5 text-sm font-medium border-2 transition-colors ${
                          dec === "aprobada"
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white text-green-700 border-green-300 hover:border-green-600"
                        }`}
                      >
                        Aprobar equivalencia
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDecision((p) => ({ ...p, [bloque.destinoId]: "rechazada" })); }}
                        className={`rounded px-4 py-1.5 text-sm font-medium border-2 transition-colors ${
                          dec === "rechazada"
                            ? "bg-red-700 text-white border-red-700"
                            : "bg-white text-red-700 border-red-300 hover:border-red-600"
                        }`}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel de resolución final */}
      {!yaCerrada && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <label className="block mb-3">
            <span className="text-sm font-medium">Comentario de resolución (opcional)</span>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 text-sm"
              placeholder="Fundamento de la resolución…"
            />
          </label>
          {err && <div className="text-sm text-red-700 mb-3">{err}</div>}
          <div className="flex items-center gap-3">
            <button
              onClick={resolver}
              disabled={saving || !todosResueltos}
              className="bg-slate-900 text-white rounded px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Confirmar resolución"}
            </button>
            {!todosResueltos && (
              <span className="text-sm text-slate-500">
                Decidí cada bloque para confirmar.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
