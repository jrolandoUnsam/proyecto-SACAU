import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = any>(text: string, params: any[] = []) {
  return pool.query<T>(text, params);
}

export function vectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
