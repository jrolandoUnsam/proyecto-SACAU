import axios from "axios";
import FormData from "form-data";

const NLP_URL = process.env.NLP_URL || "http://nlp:8000";

const client = axios.create({
  baseURL: NLP_URL,
  timeout: 60_000,
});

export async function embedText(text: string): Promise<number[]> {
  const { data } = await client.post<{ embedding: number[] }>("/embed", { text });
  return data.embedding;
}

export async function embedPdf(buffer: Buffer, filename: string): Promise<{ text: string; embedding: number[] }> {
  const form = new FormData();
  form.append("file", buffer, { filename, contentType: "application/pdf" });
  const { data } = await client.post<{ text: string; embedding: number[] }>("/embed-pdf", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data;
}
