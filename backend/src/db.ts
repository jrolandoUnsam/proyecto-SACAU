import { Pool, QueryResultRow } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []) {
  return pool.query<T>(text, params);
}

export function vectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}

export function parseVector(s: string): number[] {
  return s.slice(1, -1).split(",").map(Number);
}
