// Utilidades para comparar y resaltar los "contenidos compartidos" entre dos
// materias. El contenido_texto es un párrafo de temas separados por puntos, con
// redacción distinta entre materias, por lo que la coincidencia se hace a nivel
// de términos significativos (no de frases exactas).

// Stopwords frecuentes en español + términos de relleno comunes en descripciones
// de contenidos mínimos, que no aportan a la similitud temática.
const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "y", "o", "u", "en", "a", "ante", "con",
  "para", "por", "segun", "sin", "sobre", "tras", "su", "sus", "un", "una", "unos",
  "unas", "al", "lo", "le", "les", "se", "que", "como", "mas", "muy", "entre",
  "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "sus", "es",
  "son", "ser", "fue", "han", "hay", "cada", "tipo", "tipos", "concepto",
  "conceptos", "introduccion", "general", "generales", "distintos", "distintas",
  "estudio", "estudios", "uso", "usos", "respectivos", "respectivas", "etc",
]);

// Normaliza un token: minúsculas, sin acentos, sin puntuación.
export function normalizar(token: string): string {
  return token
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

// Extrae el conjunto de términos significativos de un texto.
export function terminosSignificativos(texto: string): Set<string> {
  const set = new Set<string>();
  if (!texto) return set;
  for (const bruto of texto.split(/\s+/)) {
    const t = normalizar(bruto);
    if (t.length > 3 && !STOPWORDS.has(t)) set.add(t);
  }
  return set;
}

// Términos significativos presentes en ambos textos.
export function terminosCompartidos(a: string, b: string): Set<string> {
  const setA = terminosSignificativos(a);
  const setB = terminosSignificativos(b);
  const comun = new Set<string>();
  for (const t of setA) if (setB.has(t)) comun.add(t);
  return comun;
}

export interface Segmento {
  text: string; // texto original (con espacios/puntuación)
  hit: boolean; // true si su forma normalizada está en `compartidos`
}

// Parte el texto conservando separadores y marca los tokens cuyo término
// normalizado pertenece al conjunto `compartidos`.
export function resaltar(texto: string, compartidos: Set<string>): Segmento[] {
  if (!texto) return [];
  // Captura grupos de palabras y grupos de no-palabras por separado.
  const partes = texto.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? [texto];
  return partes.map((parte) => {
    const norm = normalizar(parte);
    return { text: parte, hit: norm.length > 0 && compartidos.has(norm) };
  });
}
