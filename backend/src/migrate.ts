import { pool } from "./db";

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE rol AS ENUM ('estudiante', 'evaluador', 'administrador');
      EXCEPTION WHEN duplicate_object THEN null; END $$
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobada', 'aprobada_parcial', 'rechazada', 'cancelada');
      EXCEPTION WHEN duplicate_object THEN null; END $$
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS universidades (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL UNIQUE,
        creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS carreras (
        id SERIAL PRIMARY KEY,
        universidad_id INTEGER NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        total_cre INTEGER,
        plan_pdf TEXT,
        creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (universidad_id, nombre)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS materias (
        id SERIAL PRIMARY KEY,
        carrera_id INTEGER NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
        nombre TEXT NOT NULL,
        cre INTEGER NOT NULL,
        anio INTEGER,
        horas_interaccion INTEGER,
        horas_autonomo INTEGER,
        contenido_texto TEXT,
        embedding vector(768),
        creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS materias_carrera_idx ON materias(carrera_id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS materia_frases (
        id SERIAL PRIMARY KEY,
        materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
        indice SMALLINT NOT NULL,
        frase TEXT NOT NULL,
        embedding vector(768) NOT NULL
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS materia_frases_materia_idx ON materia_frases(materia_id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        dni TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE,
        nombre TEXT NOT NULL,
        rol rol NOT NULL,
        universidad_id INTEGER REFERENCES universidades(id) ON DELETE SET NULL,
        carrera_id INTEGER REFERENCES carreras(id) ON DELETE SET NULL,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS historial_academico (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
        nota NUMERIC(4,2) NOT NULL,
        fecha_aprobacion DATE NOT NULL,
        UNIQUE (usuario_id, materia_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solicitudes_equivalencia (
        id SERIAL PRIMARY KEY,
        numero_tramite TEXT NOT NULL UNIQUE,
        estudiante_id INTEGER NOT NULL REFERENCES usuarios(id),
        carrera_destino_id INTEGER NOT NULL REFERENCES carreras(id),
        estado estado_solicitud NOT NULL DEFAULT 'pendiente',
        creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resuelta_en TIMESTAMPTZ,
        evaluador_id INTEGER REFERENCES usuarios(id),
        comentario_resolucion TEXT
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS solicitudes_estado_idx ON solicitudes_equivalencia(estado)`);
    await client.query(`CREATE INDEX IF NOT EXISTS solicitudes_estudiante_idx ON solicitudes_equivalencia(estudiante_id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS items_solicitud (
        id SERIAL PRIMARY KEY,
        solicitud_id INTEGER NOT NULL REFERENCES solicitudes_equivalencia(id) ON DELETE CASCADE,
        materia_origen_id INTEGER NOT NULL REFERENCES materias(id),
        materia_destino_id INTEGER NOT NULL REFERENCES materias(id),
        similitud NUMERIC(5,4) NOT NULL,
        estado estado_solicitud NOT NULL DEFAULT 'pendiente',
        comentario TEXT,
        nota NUMERIC(4,2)
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS items_solicitud_idx ON items_solicitud(solicitud_id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS retroalimentacion (
        id SERIAL PRIMARY KEY,
        materia_origen_id INTEGER NOT NULL REFERENCES materias(id),
        materia_destino_id INTEGER NOT NULL REFERENCES materias(id),
        util BOOLEAN,
        decision estado_solicitud,
        evaluador_id INTEGER REFERENCES usuarios(id),
        creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS retro_par_idx ON retroalimentacion(materia_origen_id, materia_destino_id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS embedding_cache (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL UNIQUE,
        embedding vector(768) NOT NULL,
        frases TEXT[] NOT NULL DEFAULT '{}',
        frases_embeddings vector(768)[] NOT NULL DEFAULT '{}'
      )
    `);

    console.log("[migrate] schema OK");
  } finally {
    client.release();
  }
}
