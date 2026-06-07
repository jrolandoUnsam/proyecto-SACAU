export function dividirFrases(texto: string): string[] {
  return texto
    .split(/\.\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}
