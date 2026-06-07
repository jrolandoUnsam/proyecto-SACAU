import axios from "axios";
import FormData from "form-data";

const NLP_URL = process.env.NLP_URL || "http://nlp:8000";
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2";
const HF_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

const localClient = axios.create({ baseURL: NLP_URL, timeout: 60_000 });
const hfClient = axios.create({ timeout: 60_000 });

function l2normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? vec.map((v) => v / norm) : vec;
}

async function hfEmbedOne(text: string): Promise<number[]> {
  const { data } = await hfClient.post<number[]>(HF_URL, { inputs: text }, {
    headers: { Authorization: `Bearer ${HF_API_KEY}` },
  });
  return l2normalize(data);
}

async function hfEmbedBatch(texts: string[]): Promise<number[][]> {
  const { data } = await hfClient.post<number[][]>(HF_URL, { inputs: texts }, {
    headers: { Authorization: `Bearer ${HF_API_KEY}` },
  });
  return data.map(l2normalize);
}

export async function embedText(text: string): Promise<number[]> {
  if (HF_API_KEY) return hfEmbedOne(text);
  const { data } = await localClient.post<{ embedding: number[] }>("/embed", { text });
  return data.embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (HF_API_KEY) return hfEmbedBatch(texts);
  const { data } = await localClient.post<{ embeddings: number[][] }>("/embed-batch", { texts });
  return data.embeddings;
}

export async function embedPdf(buffer: Buffer, filename: string): Promise<{ text: string; embedding: number[] }> {
  if (HF_API_KEY) {
    // En producción: extraer texto en Node.js y embedir via HF
    const pdfParse = (await import("pdf-parse")).default;
    const { text } = await pdfParse(buffer);
    const trimmed = text.trim();
    if (!trimmed) throw new Error("PDF sin texto extraíble");
    const embedding = await hfEmbedOne(trimmed);
    return { text: trimmed, embedding };
  }
  // En desarrollo: delegar al servicio NLP local
  const form = new FormData();
  form.append("file", buffer, { filename, contentType: "application/pdf" });
  const { data } = await localClient.post<{ text: string; embedding: number[] }>("/embed-pdf", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data;
}
