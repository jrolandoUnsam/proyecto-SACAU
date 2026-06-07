import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import SimilitudBadge from "../../components/SimilitudBadge";

const UMBRAL_SUGERENCIA = 0.15;

const ORDINALES = ["1°", "2°", "3°", "4°", "5°", "6°"];
function labelAnio(n: number | null): string {
  if (!n) return "Sin año";
  return `${ORDINALES[n - 1] ?? n + "°"} Año`;
}

interface Universidad { id: number; nombre: string; }
interface Carrera { id: number; nombre: string; universidad_id: number; plan_pdf?: string | null; }

interface MateriaDestino {
  materia_destino_id: number;
  nombre: string;
  cre: number;
  anio: number | null;
  contenido_texto: string;
}
interface MateriaOrigen {
  materia_origen_id: number;
  nombre: string;
  cre: number;
  contenido_texto: string;
  carrera_origen_nombre: string;
  universidad_origen_nombre: string;
}

// Un bloque = una materia destino + las materias del alumno incluidas en ella.
interface Bloque {
  destinoId: number;
  origenIds: number[];
}

// Paleta de colores por materia origen (índice 0, 1, 2, 3…)
// Las clases deben ser strings completos para que Tailwind JIT las incluya.
const COLORES_PALETTE = [
  { highlight: "bg-sky-200",     border: "border-l-sky-400",     dot: "bg-sky-400"     },
  { highlight: "bg-yellow-200",  border: "border-l-yellow-400",  dot: "bg-yellow-400"  },
  { highlight: "bg-green-200",   border: "border-l-green-400",   dot: "bg-green-400"   },
  { highlight: "bg-fuchsia-200", border: "border-l-fuchsia-400", dot: "bg-fuchsia-400" },
];
function colorPorIndice(i: number) {
  return COLORES_PALETTE[i % COLORES_PALETTE.length];
}

// Resalta el texto de una materia origen con su color asignado.
function ContenidoResaltado({ texto, materiaOrigenId, materiaDestinoId, colorClass = "bg-yellow-200" }: {
  texto: string;
  materiaOrigenId: number;
  materiaDestinoId: number;
  colorClass?: string;
}) {
  const [modo, setModo] = useState<"cargando" | "nlp" | "fallback">("cargando");
  const [frasesDestacadas, setFrasesDestacadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!texto) { setModo("fallback"); return; }
    setModo("cargando");
    api.post("/equivalencias/resaltado", { materia_a_id: materiaOrigenId, materia_b_id: materiaDestinoId })
      .then(({ data }) => {
        setFrasesDestacadas(new Set<string>(data.frases_a));
        setModo(data.frases_a.length > 0 ? "nlp" : "fallback");
      })
      .catch(() => setModo("fallback"));
  }, [materiaOrigenId, materiaDestinoId, texto]);

  if (modo === "cargando") {
    return <p className="text-sm text-slate-400 italic">Analizando contenidos…</p>;
  }

  if (modo === "nlp") {
    const partes = texto.split(/\.\s*/).map((s) => s.trim()).filter((s) => s);
    return (
      <p className="text-sm leading-relaxed text-slate-700">
        {partes.map((frase, i) => (
          <span key={i}>
            {frasesDestacadas.has(frase)
              ? <mark className={`${colorClass} font-semibold rounded px-0.5`}>{frase}</mark>
              : frase}
            {i < partes.length - 1 ? ". " : ""}
          </span>
        ))}
      </p>
    );
  }

  // fallback: texto sin resaltado
  return <p className="text-sm leading-relaxed text-slate-700">{texto}</p>;
}

// Resalta el texto de la materia DESTINO con colores por materia origen.
// Hace una llamada por cada fuente y asigna el color de la primera fuente que la detecte.
function ContenidoDestinoResaltado({ texto, materiaDestinoId, fuentes }: {
  texto: string;
  materiaDestinoId: number;
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
      for (const { frases, colorClass } of resultados) {
        for (const frase of frases) {
          if (!mapa.has(frase)) mapa.set(frase, colorClass);
        }
      }
      setFrasesMap(mapa);
      setModo("listo");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, nuevaKey]);

  if (modo === "cargando") {
    return <p className="text-sm text-slate-400 italic">Analizando contenidos…</p>;
  }

  if (modo === "listo") {
    const partes = texto.split(/\.\s*/).map((s) => s.trim()).filter((s) => s);
    return (
      <p className="text-sm leading-relaxed text-slate-700">
        {partes.map((frase, i) => {
          const color = frasesMap.get(frase);
          return (
            <span key={i}>
              {color
                ? <mark className={`${color} font-semibold rounded px-0.5`}>{frase}</mark>
                : frase}
              {i < partes.length - 1 ? ". " : ""}
            </span>
          );
        })}
      </p>
    );
  }

  // fallback: texto sin resaltado
  return <p className="text-sm leading-relaxed text-slate-700">{texto}</p>;
}

export default function Solicitar() {
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [uniId, setUniId] = useState<number | "">("");
  const [carId, setCarId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState<{ numero_tramite: string } | null>(null);
  const [errorDuplicado, setErrorDuplicado] = useState<{ numero_tramite: string } | null>(null);

  // Datos de la matriz cargada.
  const [destino, setDestino] = useState<MateriaDestino[] | null>(null);
  const [origen, setOrigen] = useState<MateriaOrigen[]>([]);
  const [simMap, setSimMap] = useState<Map<string, number>>(new Map());

  // Estado mutable de la solicitud que arma el alumno.
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());

  // Buscador global para agregar una materia destino que no fue sugerida.
  const [busqueda, setBusqueda] = useState("");
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  useEffect(() => {
    api.get("/universidades").then((r) => setUniversidades(r.data));
  }, []);

  useEffect(() => {
    if (!uniId) { setCarreras([]); setCarId(""); return; }
    api.get(`/carreras?universidad_id=${uniId}`).then((r) => setCarreras(r.data));
  }, [uniId]);

  const sim = (oId: number, dId: number) => simMap.get(`${oId}-${dId}`) ?? 0;

  const destinoMap = useMemo(() => {
    const m = new Map<number, MateriaDestino>();
    (destino ?? []).forEach((d) => m.set(d.materia_destino_id, d));
    return m;
  }, [destino]);

  const origenMap = useMemo(() => {
    const m = new Map<number, MateriaOrigen>();
    origen.forEach((o) => m.set(o.materia_origen_id, o));
    return m;
  }, [origen]);

  async function calcularSugerencias() {
    if (!carId) return;
    setLoading(true);
    setDestino(null);
    setBloques([]);
    setAbiertos(new Set());
    setBusqueda("");
    setEnviado(null);
    setErrorDuplicado(null);
    try {
      const { data } = await api.get(`/equivalencias/matriz?carrera_destino_id=${carId}`);
      const dest: MateriaDestino[] = data.destino;
      const orig: MateriaOrigen[] = data.origen;
      const map = new Map<string, number>(
        data.similitudes.map((s: any) => [`${s.materia_origen_id}-${s.materia_destino_id}`, Number(s.similitud)])
      );
      setDestino(dest);
      setOrigen(orig);
      setSimMap(map);

      // Asignación greedy: cada materia del alumno va al único destino donde tiene mayor similitud.
      // Esto evita que una materia propia aparezca en múltiples bloques.
      const pares: { oId: number; dId: number; s: number }[] = [];
      for (const d of dest) {
        for (const o of orig) {
          const s = map.get(`${o.materia_origen_id}-${d.materia_destino_id}`) ?? 0;
          if (s >= UMBRAL_SUGERENCIA) pares.push({ oId: o.materia_origen_id, dId: d.materia_destino_id, s });
        }
      }
      pares.sort((a, b) => b.s - a.s);

      const asignados = new Set<number>();
      const bloquePorDestino = new Map<number, number[]>();
      for (const { oId, dId } of pares) {
        if (asignados.has(oId)) continue;
        if (!bloquePorDestino.has(dId)) bloquePorDestino.set(dId, []);
        bloquePorDestino.get(dId)!.push(oId);
        asignados.add(oId);
      }

      const nuevos: Bloque[] = dest
        .filter((d) => bloquePorDestino.has(d.materia_destino_id))
        .map((d) => ({ destinoId: d.materia_destino_id, origenIds: bloquePorDestino.get(d.materia_destino_id)! }));
      setBloques(nuevos);
    } finally {
      setLoading(false);
    }
  }

  function toggleAbierto(dId: number) {
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(dId)) next.delete(dId); else next.add(dId);
      return next;
    });
  }

  function agregarOrigen(dId: number, oId: number) {
    setBloques((prev) =>
      prev.map((b) =>
        b.destinoId === dId && !b.origenIds.includes(oId)
          ? { ...b, origenIds: [...b.origenIds, oId] }
          : b
      )
    );
  }

  function quitarOrigen(dId: number, oId: number) {
    setBloques((prev) =>
      prev.map((b) => (b.destinoId === dId ? { ...b, origenIds: b.origenIds.filter((x) => x !== oId) } : b))
    );
  }

  function quitarBloque(dId: number) {
    setBloques((prev) => prev.filter((b) => b.destinoId !== dId));
  }

  function agregarBloqueDestino(dId: number) {
    setBloques((prev) => (prev.some((b) => b.destinoId === dId) ? prev : [...prev, { destinoId: dId, origenIds: [] }]));
    setAbiertos((prev) => new Set(prev).add(dId));
    setBusqueda("");
    setBuscadorAbierto(false);
  }

  // Materias destino que aún no son bloque (para el buscador global).
  const destinoDisponibles = useMemo(() => {
    if (!destino) return [];
    const usados = new Set(bloques.map((b) => b.destinoId));
    const q = busqueda.trim().toLowerCase();
    return destino
      .filter((d) => !usados.has(d.materia_destino_id))
      .filter((d) => (q ? d.nombre.toLowerCase().includes(q) : true));
  }, [destino, bloques, busqueda]);

  const totalItems = useMemo(() => bloques.reduce((n, b) => n + b.origenIds.length, 0), [bloques]);

  async function enviar() {
    if (!carId) return;
    const pares = new Set<string>();
    const items: { materia_origen_id: number; materia_destino_id: number }[] = [];
    for (const b of bloques) {
      for (const oId of b.origenIds) {
        const key = `${oId}-${b.destinoId}`;
        if (pares.has(key)) continue;
        pares.add(key);
        items.push({ materia_origen_id: oId, materia_destino_id: b.destinoId });
      }
    }
    if (items.length === 0) return;
    setLoading(true);
    setErrorDuplicado(null);
    try {
      const { data } = await api.post("/solicitudes", { carrera_destino_id: carId, items });
      setEnviado({ numero_tramite: data.numero_tramite });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErrorDuplicado({ numero_tramite: err.response.data.numero_tramite });
      }
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Solicitud enviada</h2>
        <p className="text-slate-600 mb-6">Tu solicitud fue recibida y está siendo procesada.</p>
        <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm text-slate-500 mb-1">Número de trámite</div>
          <div className="text-xl font-mono font-bold">{enviado.numero_tramite}</div>
          <div className="text-sm text-yellow-600 mt-2">Estado: Pendiente de revisión</div>
        </div>
        <Link
          to="/estudiante/solicitudes"
          className="inline-block bg-slate-900 text-white rounded px-6 py-2 hover:bg-slate-700"
        >
          Ver mis solicitudes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Solicitar equivalencia</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">1. Elegir carrera destino</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label>
            <span className="text-sm">Universidad</span>
            <select
              value={uniId}
              onChange={(e) => { setUniId(e.target.value ? Number(e.target.value) : ""); setErrorDuplicado(null); }}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
            >
              <option value="">— elegir —</option>
              {universidades.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm">Carrera</span>
            <select
              value={carId}
              onChange={(e) => { setCarId(e.target.value ? Number(e.target.value) : ""); setErrorDuplicado(null); }}
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              disabled={!uniId}
            >
              <option value="">— elegir —</option>
              {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button
              onClick={calcularSugerencias}
              disabled={!carId || loading}
              className="bg-slate-900 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Cargar sugerencias"}
            </button>
            {carId && (() => {
              const carrera = carreras.find((c) => c.id === carId);
              return carrera?.plan_pdf ? (
                <a
                  href={`/${carrera.plan_pdf}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-sky-700 underline underline-offset-2 hover:text-sky-900"
                >
                  Ver plan de estudios (PDF)
                </a>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {destino && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">2. Revisar equivalencias sugeridas</h2>
            <span className="text-sm text-slate-500">
              Bloques con similitud ≥ {(UMBRAL_SUGERENCIA * 100).toFixed(0)}%
            </span>
          </div>

          {origen.length === 0 && (
            <p className="text-slate-500 bg-white rounded-lg shadow p-4">No hay materias en tu historial.</p>
          )}

          {origen.length > 0 && bloques.length === 0 && (
            <p className="text-slate-500 bg-white rounded-lg shadow p-4">
              No se encontraron equivalencias sugeridas por encima del umbral. Podés agregar una materia destino
              manualmente más abajo.
            </p>
          )}

          {(() => {
            // Group bloques by academic year of the destination subject
            const porAnio = new Map<string, typeof bloques>();
            for (const b of bloques) {
              const d = destinoMap.get(b.destinoId);
              const key = labelAnio(d?.anio ?? null);
              if (!porAnio.has(key)) porAnio.set(key, []);
              porAnio.get(key)!.push(b);
            }
            return Array.from(porAnio.entries()).map(([anioLabel, grupoB]) => (
              <div key={anioLabel} className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">{anioLabel}</h3>
                <div className="space-y-3">
                  {grupoB.map((b) => {
                    const d = destinoMap.get(b.destinoId);
                    if (!d) return null;
              const mejor = b.origenIds.reduce((max, oId) => Math.max(max, sim(oId, b.destinoId)), 0);
              const disponibles = origen.filter((o) => !b.origenIds.includes(o.materia_origen_id));
              const abierto = abiertos.has(b.destinoId);
              return (
                <div key={b.destinoId} className="bg-white rounded-lg shadow flex flex-col">
                  {/* Header row */}
                  <div className="flex items-stretch">
                    <button
                      onClick={() => toggleAbierto(b.destinoId)}
                      className="flex-1 text-left p-4 flex items-start justify-between gap-4 min-w-0"
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{d.nombre}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{d.cre} CRE · carrera destino</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.origenIds.length === 0 && (
                            <span className="text-xs text-slate-400 italic">Sin materias propias — agregá una al expandir</span>
                          )}
                          {b.origenIds.map((oId, i) => (
                            <span key={oId} className={`text-xs ${colorPorIndice(i).highlight} text-slate-800 rounded px-2 py-0.5`}>
                              {origenMap.get(oId)?.nombre ?? `#${oId}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {mejor > 0 && <SimilitudBadge valor={mejor} />}
                        <span className="text-slate-400 text-sm">{abierto ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => quitarBloque(b.destinoId)}
                      className="px-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-r-lg border-l border-slate-100 transition-colors shrink-0"
                      title="Rechazar este bloque"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Expanded panel */}
                  {abierto && (
                    <div className="border-t p-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs font-semibold uppercase text-slate-400 mb-1">
                            Materia destino
                          </div>
                          <div className="font-medium mb-1">{d.nombre}</div>
                          <ContenidoDestinoResaltado
                            texto={d.contenido_texto || ""}
                            materiaDestinoId={b.destinoId}
                            fuentes={b.origenIds.map((oId, i) => ({
                              materiaOrigenId: oId,
                              colorClass: colorPorIndice(i).highlight,
                            }))}
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="text-xs font-semibold uppercase text-slate-400">Mis materias</div>
                          {b.origenIds.length === 0 && (
                            <p className="text-sm text-slate-400 italic">Todavía no agregaste materias propias a este bloque.</p>
                          )}
                          {b.origenIds.map((oId, i) => {
                            const o = origenMap.get(oId);
                            if (!o) return null;
                            const color = colorPorIndice(i);
                            return (
                              <div key={oId} className={`border-l-4 ${color.border} border border-slate-200 rounded-r p-3`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`} />
                                    <div className="font-medium">{o.nombre}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <SimilitudBadge valor={sim(oId, b.destinoId)} />
                                    <button
                                      onClick={() => quitarOrigen(b.destinoId, oId)}
                                      className="text-slate-400 hover:text-red-600 text-sm"
                                      title="Quitar del bloque"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">
                                  {o.universidad_origen_nombre} · {o.cre} CRE
                                </div>
                                <ContenidoResaltado texto={o.contenido_texto || ""} materiaOrigenId={oId} materiaDestinoId={b.destinoId} colorClass={color.highlight} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t">
                        <label className="text-sm flex items-center gap-2">
                          <span className="text-slate-500">Agregar materia mía:</span>
                          <select
                            value=""
                            onChange={(e) => e.target.value && agregarOrigen(b.destinoId, Number(e.target.value))}
                            disabled={disponibles.length === 0}
                            className="border border-slate-300 rounded px-3 py-1.5 text-sm disabled:opacity-50"
                          >
                            <option value="">— elegir materia —</option>
                            {disponibles.map((o) => (
                              <option key={o.materia_origen_id} value={o.materia_origen_id}>
                                {o.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          onClick={() => quitarBloque(b.destinoId)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Quitar bloque
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                  );
                  })}
                </div>
              </div>
            ));
          })()}

          {/* Acción global: agregar una materia destino que no fue sugerida */}
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <div className="text-sm font-medium mb-2">¿Falta una materia destino?</div>
            <div className="relative max-w-md">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setBuscadorAbierto(true); }}
                onFocus={() => setBuscadorAbierto(true)}
                onBlur={() => setTimeout(() => setBuscadorAbierto(false), 150)}
                placeholder="Buscar materia de la carrera destino…"
                className="block w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
              {buscadorAbierto && destinoDisponibles.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded shadow max-h-60 overflow-auto">
                  {destinoDisponibles.map((d) => (
                    <li key={d.materia_destino_id}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => agregarBloqueDestino(d.materia_destino_id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                      >
                        {d.nombre}
                        <span className="text-xs text-slate-400"> · {d.cre} CRE</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {destino && (origen.length > 0 || bloques.length > 0) && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between">
          <div className="text-sm">
            Bloques: <b>{bloques.length}</b> · Equivalencias propuestas: <b>{totalItems}</b>
          </div>
          <button
            onClick={enviar}
            disabled={totalItems === 0 || loading}
            className="bg-green-700 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            3. Enviar solicitud
          </button>
        </div>
      )}

      {errorDuplicado && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">Ya existe una solicitud activa para esta carrera</div>
          <div className="text-sm text-red-700 mt-1">
            Número de trámite existente: <b>{errorDuplicado.numero_tramite}</b>
          </div>
        </div>
      )}
    </div>
  );
}
