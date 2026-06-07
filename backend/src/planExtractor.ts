import pdfParse from "pdf-parse";
import {
  MATERIAS_NUTRICION_UNAHUR,
  UNAHUR_CARRERA,
  UNAHUR_TOTAL_CRE,
} from "./data/nutricionUNAHUR";

export interface MateriaExtraida {
  nombre: string;
  anio: number;
  cre: number;
  horas_interaccion: number;
  horas_autonomo: number;
  contenido_texto: string;
}

export interface PlanExtraido {
  carrera_nombre: string;
  total_cre: number;
  materias: MateriaExtraida[];
}

async function extractWithClaude(text: string, apiKey: string): Promise<PlanExtraido> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Sos un extractor de datos de planes de estudio universitarios argentinos.
Del siguiente texto extraído de un PDF, identificá y devolvé SOLO un objeto JSON con esta estructura exacta (sin texto adicional antes o después):

{
  "carrera_nombre": "nombre completo de la carrera",
  "total_cre": total_de_creditos_numero,
  "materias": [
    {
      "nombre": "nombre de la materia",
      "anio": año_numero,
      "cre": creditos_numero,
      "horas_interaccion": horas_interaccion_numero,
      "horas_autonomo": horas_autonomo_numero,
      "contenido_texto": "descripción completa del contenido de la materia"
    }
  ]
}

Reglas:
- anio: debe ser 1, 2, 3, 4 o 5 según el año de la carrera
- Si no encontrás un campo numérico, usá 0
- contenido_texto: incluí toda la descripción de temas de la materia, completa
- Incluí TODAS las materias del plan
- No incluyas texto fuera del JSON

TEXTO DEL PDF:
${text.slice(0, 60000)}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch)
    throw new Error("No se pudo extraer la estructura del plan desde el PDF.");

  const plan = JSON.parse(jsonMatch[0]) as PlanExtraido;
  if (!plan.carrera_nombre || !Array.isArray(plan.materias))
    throw new Error("El PDF no contiene un plan de estudios válido.");

  return plan;
}

// Detecta si el texto corresponde al plan de UNAHUR Nutrición
function esUNAHURNutricion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("hurlingham") &&
    (lower.includes("nutrici") || lower.includes("nutric"))
  );
}

export async function extractPlanFromPdf(buffer: Buffer): Promise<PlanExtraido> {
  const { text } = await pdfParse(buffer);
  if (!text.trim()) throw new Error("El PDF no contiene texto extraíble.");

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Si hay API key de Anthropic, usar Claude para extracción real
  if (apiKey) {
    return extractWithClaude(text, apiKey);
  }

  // Sin API key: usar datos pre-extraídos según el PDF detectado
  if (esUNAHURNutricion(text)) {
    return {
      carrera_nombre: UNAHUR_CARRERA,
      total_cre: UNAHUR_TOTAL_CRE,
      materias: MATERIAS_NUTRICION_UNAHUR.map((m) => ({
        nombre: m.nombre,
        anio: m.anio,
        cre: m.cre,
        horas_interaccion: m.horas_interaccion,
        horas_autonomo: m.horas_autonomo,
        contenido_texto: m.contenido_texto,
      })),
    };
  }

  throw new Error(
    "No se reconoce el PDF. Configurá ANTHROPIC_API_KEY para procesar planes de otras universidades."
  );
}
