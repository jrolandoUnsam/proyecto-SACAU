import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

interface ItemDetalle {
  id: number;
  similitud: number;
  estado: "pendiente" | "aprobada" | "aprobada_parcial" | "rechazada";
  comentario: string | null;
  nota_historial: number | null;
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
  anio_destino: number | null;
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
  plan_pdf_origen: string | null;
  plan_pdf_destino: string | null;
  comentario_resolucion: string | null;
  items: ItemDetalle[];
}

interface Bloque {
  destinoId: number;
  destinoNombre: string;
  anioDestino: number | null;
  creDestino: number;
  horasIntDestino: number | null;
  horasAutDestino: number | null;
  contenidoDestino: string;
  items: ItemDetalle[];
}

type DecisionBloque = "aprobada" | "aprobada_parcial" | "rechazada";

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

const COLORES_PALETTE = [
  "bg-sky-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-fuchsia-200",
];

function ContenidoResaltado({ materiaOrigenId, materiaDestinoId, texto, colorClass = "bg-yellow-200" }: {
  materiaOrigenId: number;
  materiaDestinoId: number;
  texto: string;
  colorClass?: string;
}) {
  const [modo, setModo] = useState<"cargando" | "nlp" | "fallback">("cargando");
  const [frases, setFrases] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!texto) { setModo("fallback"); return; }
    setModo("cargando");
    api.post("/equivalencias/resaltado", { materia_a_id: materiaOrigenId, materia_b_id: materiaDestinoId })
      .then(({ data }) => {
        setFrases(new Set<string>(data.frases_a));
        setModo(data.frases_a.length > 0 ? "nlp" : "fallback");
      })
      .catch(() => setModo("fallback"));
  }, [materiaOrigenId, materiaDestinoId, texto]);

  if (modo === "cargando") return <p className="text-sm text-slate-400 italic">Analizando…</p>;

  if (modo === "nlp") {
    const partes = texto.split(/\.\s*/).map((s) => s.trim()).filter(Boolean);
    return (
      <p className="text-sm leading-relaxed">
        {partes.map((f, i) => (
          <span key={i}>
            {frases.has(f) ? <mark className={`${colorClass} font-semibold rounded px-0.5`}>{f}</mark> : f}
            {i < partes.length - 1 ? ". " : ""}
          </span>
        ))}
      </p>
    );
  }

  return <p className="text-sm leading-relaxed">{texto}</p>;
}

function ContenidoDestinoResaltado({ materiaDestinoId, texto, fuentes }: {
  materiaDestinoId: number;
  texto: string;
  fuentes: { materiaOrigenId: number; colorClass: string }[];
}) {
  const [frasesMap, setFrasesMap] = useState<Map<string, string>>(new Map());
  const [modo, setModo] = useState<"cargando" | "listo" | "fallback">("cargando");
  const fuentesKey = useRef("");
  const nuevaKey = fuentes.map((f) => f.materiaOrigenId).join(",");

  useEffect(() => {
    if (!texto || fuentes.length === 0) { setModo("fallback"); return; }
    if (nuevaKey === fuentesKey.current && modo !== "cargando") return;
    fuentesKey.current = nuevaKey;
    setModo("cargando");

    Promise.all(
      fuentes.map(({ materiaOrigenId, colorClass }) =>
        api.post("/equivalencias/resaltado", { materia_a_id: materiaDestinoId, materia_b_id: materiaOrigenId })
          .then(({ data }) => ({ frases: data.frases_a as string[], colorClass }))
          .catch(() => ({ frases: [] as string[], colorClass }))
      )
    ).then((resultados) => {
      const mapa = new Map<string, string>();
      for (const { frases, colorClass } of resultados)
        for (const frase of frases)
          if (!mapa.has(frase)) mapa.set(frase, colorClass);
      setFrasesMap(mapa);
      setModo("listo");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, nuevaKey]);

  if (modo === "cargando") return <p className="text-sm text-slate-400 italic">Analizando…</p>;

  if (modo === "listo") {
    const partes = texto.split(/\.\s*/).map((s) => s.trim()).filter(Boolean);
    return (
      <p className="text-sm leading-relaxed">
        {partes.map((f, i) => {
          const color = frasesMap.get(f);
          return (
            <span key={i}>
              {color ? <mark className={`${color} font-semibold rounded px-0.5`}>{f}</mark> : f}
              {i < partes.length - 1 ? ". " : ""}
            </span>
          );
        })}
      </p>
    );
  }

  return <p className="text-sm leading-relaxed">{texto}</p>;
}

interface Antecedente {
  numero_tramite: string;
  resuelta_en: string | null;
  estado: string;
  comentario: string | null;
  nota: number | null;
  evaluador_nombre: string | null;
}

const antecedenteBadge: Record<string, string> = {
  aprobada: "bg-green-100 text-green-800",
  aprobada_parcial: "bg-blue-100 text-blue-800",
  rechazada: "bg-red-100 text-red-800",
};
const antecedenteLabel: Record<string, string> = {
  aprobada: "Aprobada",
  aprobada_parcial: "Aprobada parcialmente",
  rechazada: "Rechazada",
};

function Antecedentes({ materiaOrigenId, materiaDestinoId }: { materiaOrigenId: number; materiaDestinoId: number }) {
  const [datos, setDatos] = useState<Antecedente[] | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    api.get("/equivalencias/antecedentes", {
      params: { materia_origen_id: materiaOrigenId, materia_destino_id: materiaDestinoId },
    }).then((r) => setDatos(r.data));
  }, [materiaOrigenId, materiaDestinoId]);

  if (!datos) return null;

  if (datos.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic px-1 py-1">
        Sin antecedentes previos para este par de materias.
      </div>
    );
  }

  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-amber-900 hover:bg-amber-100"
      >
        <span>Antecedentes — {datos.length} resolución{datos.length !== 1 ? "es" : ""} previa{datos.length !== 1 ? "s" : ""} para este par de materias</span>
        <svg className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {abierto && (
        <ul className="divide-y divide-amber-200 border-t border-amber-200">
          {datos.map((a, i) => (
            <li key={i} className="px-3 py-2 flex items-start gap-3 text-sm">
              <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${antecedenteBadge[a.estado] ?? "bg-slate-100 text-slate-700"}`}>
                {antecedenteLabel[a.estado] ?? a.estado}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-slate-700">
                  Trámite <span className="font-mono font-medium">{a.numero_tramite}</span>
                  {a.nota != null && (
                    <span className="ml-2 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold text-xs">Nota: {Number(a.nota).toFixed(0)}</span>
                  )}
                  {a.resuelta_en && (
                    <span className="ml-2 text-slate-400 text-xs">{new Date(a.resuelta_en).toLocaleDateString("es-AR")}</span>
                  )}
                  {a.evaluador_nombre && (
                    <span className="ml-2 text-slate-400 text-xs">· {a.evaluador_nombre}</span>
                  )}
                </div>
                {a.comentario && (
                  <div className="text-slate-500 text-xs mt-0.5 italic">"{a.comentario}"</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResolverSolicitud() {
  const { id } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState<Detalle | null>(null);
  // decision por bloque (materia destino)
  const [decision, setDecision] = useState<Record<number, DecisionBloque>>({});
  // comentario por bloque
  const [comentariosBloque, setComentariosBloque] = useState<Record<number, string>>({});
  // nota por bloque (destinoId → nota string)
  const [notasBloque, setNotasBloque] = useState<Record<number, string>>({});
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
          anioDestino: it.anio_destino,
          creDestino: it.cre_destino,
          horasIntDestino: it.horas_int_destino,
          horasAutDestino: it.horas_aut_destino,
          contenidoDestino: it.contenido_destino,
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

    const sinDecision = bloques.find((b) => !decision[b.destinoId]);
    if (sinDecision) {
      setErr(`Falta decidir el bloque: ${sinDecision.destinoNombre}`);
      return;
    }

    // Todos los ítems del bloque heredan la decisión y nota del bloque
    const items_estado: Record<string, DecisionBloque> = {};
    const comentarios_items: Record<string, string> = {};
    const notas_items: Record<string, number | null> = {};
    for (const bloque of bloques) {
      const dec = decision[bloque.destinoId]!;
      const textoComentario = comentariosBloque[bloque.destinoId]?.trim();
      const notaStr = notasBloque[bloque.destinoId]?.trim();
      const notaFallback = bloque.items[0]?.nota_historial != null
        ? String(Math.round(Number(bloque.items[0].nota_historial)))
        : null;
      const notaVal = notaStr ? parseFloat(notaStr) : notaFallback ? parseFloat(notaFallback) : null;
      for (const item of bloque.items) {
        items_estado[item.id] = dec;
        if (textoComentario) comentarios_items[item.id] = textoComentario;
        notas_items[item.id] = notaVal;
      }
    }

    setSaving(true);
    setErr(null);
    try {
      await api.put(`/solicitudes/${d.id}`, {
        items_estado,
        comentarios_items,
        notas_items,
        comentario: comentario.trim() || undefined,
      });
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
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Solicitud {d.numero_tramite}</h1>
              {yaCerrada && (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[d.estado] ?? ""}`}>
                  {estadoLabel[d.estado] ?? d.estado}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-600">
              {d.estudiante_nombre}
              {d.estudiante_dni ? <span className="text-slate-400"> · DNI {d.estudiante_dni}</span> : null}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {d.plan_pdf_origen && (
              <a
                href={`/${d.plan_pdf_origen}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Plan origen (PDF)
              </a>
            )}
            {d.plan_pdf_destino && (
              <a
                href={`/${d.plan_pdf_destino}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-300 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Plan destino (PDF)
              </a>
            )}
          </div>
        </div>

        {/* Visual origen → destino */}
        {(() => {
          const primerItem = d.items[0];
          const uniOrigen = primerItem?.universidad_origen_nombre ?? null;
          const carreraOrigen = primerItem?.carrera_origen_nombre ?? null;
          return (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-0.5">Origen</div>
                <div className="text-sm font-semibold text-blue-900 leading-tight">{uniOrigen ?? "—"}</div>
                <div className="text-xs text-blue-600 leading-tight">{carreraOrigen ?? "—"}</div>
              </div>
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-green-400 mb-0.5">Destino</div>
                <div className="text-sm font-semibold text-green-900 leading-tight">{d.universidad_destino_nombre}</div>
                <div className="text-xs text-green-600 leading-tight">{d.carrera_destino_nombre}</div>
              </div>
            </div>
          );
        })()}

        {yaCerrada && d.comentario_resolucion && (
          <div className="mt-3 text-sm bg-slate-50 rounded p-3">
            <b>Comentario:</b> {d.comentario_resolucion}
          </div>
        )}
      </div>

      {/* Bloques agrupados por año del plan de estudios */}
      {(() => {
        // Agrupar bloques por año (null → "Sin año asignado")
        const porAnio = new Map<number | null, Bloque[]>();
        for (const b of bloques) {
          const key = b.anioDestino ?? null;
          if (!porAnio.has(key)) porAnio.set(key, []);
          porAnio.get(key)!.push(b);
        }
        // Ordenar: años numéricos asc, null al final
        const entradas = [...porAnio.entries()].sort(([a], [b]) => {
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        });
        const anioPorNum: Record<number, string> = { 1: "1.er año", 2: "2.° año", 3: "3.er año", 4: "4.° año", 5: "5.° año" };
        return entradas.map(([anio, grupo]) => (
          <div key={anio ?? "sin-anio"} className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />
              {anio !== null ? (anioPorNum[anio] ?? `${anio}.° año`) : "Sin año asignado"}
              <span className="h-px flex-1 bg-slate-200" />
            </h2>
            <div className="space-y-4">
              {grupo.map((bloque) => {
          const abierto = expandidos.has(bloque.destinoId);
          const dec = decision[bloque.destinoId];
          const bestSim = Math.max(...bloque.items.map((it) => Number(it.similitud)));
          const estadoBloque = yaCerrada ? bloque.items[0]?.estado : undefined;

          const fuentesDestino = bloque.items.map((it, i) => ({
            materiaOrigenId: it.materia_origen_id,
            colorClass: COLORES_PALETTE[i % COLORES_PALETTE.length],
          }));

          return (
            <div key={bloque.destinoId} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Cabecera */}
              <div
                className="flex items-start justify-between p-4 cursor-pointer select-none hover:bg-slate-50"
                onClick={() => toggle(bloque.destinoId)}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-semibold">{bloque.destinoNombre}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-0.5 rounded-full">{bloque.creDestino} CRE</span>
                    <span className="text-xs text-slate-500">
                      {bloque.items.length === 1
                        ? bloque.items[0].materia_origen_nombre
                        : `${bloque.items.length} materias propuestas: ${bloque.items.map((it) => it.materia_origen_nombre).join(", ")}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(estadoBloque || dec) && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${estadoColor[estadoBloque ?? dec ?? ""] ?? ""}`}>
                      {estadoLabel[estadoBloque ?? dec ?? ""] ?? estadoBloque ?? dec}
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
                  {/* Comparación lado a lado: destino (izq) | orígenes apilados (der) */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Columna izquierda: materia destino (una sola vez) */}
                    <div className="border rounded p-3 bg-slate-50 self-start">
                      <div className="text-xs font-semibold uppercase text-slate-500 mb-1">
                        Destino — {bloque.destinoNombre}
                      </div>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-0.5 rounded-full">{bloque.creDestino} CRE</span>
                        {bloque.horasIntDestino != null && <span className="text-xs text-slate-400">{bloque.horasIntDestino}h interacción</span>}
                        {bloque.horasAutDestino != null && <span className="text-xs text-slate-400">{bloque.horasAutDestino}h autónomo</span>}
                      </div>
                      <ContenidoDestinoResaltado
                        materiaDestinoId={bloque.destinoId}
                        texto={bloque.contenidoDestino}
                        fuentes={fuentesDestino}
                      />
                    </div>

                    {/* Columna derecha: materias del alumno apiladas */}
                    <div className="space-y-3">
                      {bloque.items.map((it, i) => {
                        const colorClass = COLORES_PALETTE[i % COLORES_PALETTE.length];
                        return (
                          <div key={it.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <div className="text-xs font-semibold uppercase text-slate-600 leading-tight">
                                {it.materia_origen_nombre}
                              </div>
                              <SimilitudBadge valor={Number(it.similitud)} />
                            </div>
                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                              <span>{it.universidad_origen_nombre}</span>
                              <span className="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-0.5 rounded-full">{it.cre_origen} CRE</span>
                              {it.nota_historial != null && (
                                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                                  Nota: {Number(it.nota_historial).toFixed(0)}
                                </span>
                              )}
                            </div>
                            <ContenidoResaltado
                              materiaOrigenId={it.materia_origen_id}
                              materiaDestinoId={bloque.destinoId}
                              texto={it.contenido_origen}
                              colorClass={colorClass}
                            />
                            <Antecedentes
                              materiaOrigenId={it.materia_origen_id}
                              materiaDestinoId={bloque.destinoId}
                            />
                            {yaCerrada && it.comentario && (
                              <div className="mt-2 text-xs italic text-slate-500">{it.comentario}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comentario + decisión por bloque — solo cuando está pendiente */}
                  {!yaCerrada && (
                    <div className="pt-3 border-t space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Comentario para este bloque (opcional)
                        </label>
                        <textarea
                          value={comentariosBloque[bloque.destinoId] ?? ""}
                          onChange={(e) =>
                            setComentariosBloque((prev) => ({ ...prev, [bloque.destinoId]: e.target.value }))
                          }
                          rows={2}
                          className="block w-full border border-slate-300 rounded px-3 py-2 text-sm"
                          placeholder="Fundamento de la decisión para este bloque…"
                        />
                      </div>
                      {/* Nota — se muestra solo al aprobar totalmente */}
                      {decision[bloque.destinoId] === "aprobada" && (
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
                            Nota de la equivalencia
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            step={0.5}
                            value={notasBloque[bloque.destinoId] ?? (() => {
                              const ref = bloque.items[0]?.nota_historial;
                              return ref != null ? String(Math.round(Number(ref))) : "";
                            })()}
                            onChange={(e) =>
                              setNotasBloque((prev) => ({ ...prev, [bloque.destinoId]: e.target.value }))
                            }
                            placeholder="Ej: 7"
                            className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm text-center"
                          />
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
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
                          onClick={(e) => { e.stopPropagation(); setDecision((p) => ({ ...p, [bloque.destinoId]: "aprobada_parcial" })); }}
                          className={`rounded px-4 py-1.5 text-sm font-medium border-2 transition-colors ${
                            dec === "aprobada_parcial"
                              ? "bg-blue-700 text-white border-blue-700"
                              : "bg-white text-blue-700 border-blue-300 hover:border-blue-600"
                          }`}
                        >
                          Aprobar parcialmente
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
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })}
            </div>
          </div>
        ));
      })()}

      {/* Panel de resolución final */}
      {!yaCerrada && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <label className="block mb-3">
            <span className="text-sm font-medium">Comentario general de resolución (opcional)</span>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2 text-sm"
              placeholder="Fundamento general de la resolución…"
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
