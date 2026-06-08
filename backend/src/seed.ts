import bcrypt from "bcryptjs";
import { PoolClient } from "pg";
import { pool, query, vectorLiteral } from "./db";
import { embedText, embedBatch } from "./nlp";
import { dividirFrases } from "./utils";
import {
  MATERIAS_NUTRICION_UNAHUR,
  UNAHUR_UNIVERSIDAD,
  UNAHUR_CARRERA,
  UNAHUR_TOTAL_CRE,
  UNAHUR_PLAN_PDF,
} from "./data/nutricionUNAHUR";
import {
  MATERIAS_NUTRICION_BELGRANO,
  BELGRANO_UNIVERSIDAD,
  BELGRANO_CARRERA,
  BELGRANO_TOTAL_CRE,
  BELGRANO_PLAN_PDF,
} from "./data/nutricionBelgrano";

type MateriaSeed = {
  nombre: string;
  cre: number;
  anio?: number;
  horas_interaccion: number;
  horas_autonomo: number;
  contenido_texto: string;
};

type CarreraSeed = {
  nombre: string;
  total_cre: number;
  plan_pdf?: string;
  materias: MateriaSeed[];
};

type UniversidadSeed = {
  nombre: string;
  carreras: CarreraSeed[];
};

// UNAHUR empieza sin carreras: el admin sube el PDF del plan de estudios
// para que el sistema lo procese y genere las materias automáticamente.
const DATA: UniversidadSeed[] = [
  {
    nombre: UNAHUR_UNIVERSIDAD,
    carreras: [],
  },
  {
    nombre: BELGRANO_UNIVERSIDAD,
    carreras: [
      {
        nombre: BELGRANO_CARRERA,
        total_cre: BELGRANO_TOTAL_CRE,
        plan_pdf: BELGRANO_PLAN_PDF,
        materias: MATERIAS_NUTRICION_BELGRANO,
      },
    ],
  },
];

const USUARIOS: Array<{
  dni: string;
  password: string;
  email: string;
  nombre: string;
  rol: "estudiante" | "evaluador" | "administrador";
  universidad?: string;
  carrera?: string;
}> = [
  {
    dni: "30000001",
    password: "admin123",
    email: "admin@belgrano.edu.ar",
    nombre: "Patricia Admin (Belgrano)",
    rol: "administrador",
    universidad: BELGRANO_UNIVERSIDAD,
  },
  {
    dni: "30000002",
    password: "admin123",
    email: "admin@unahur.edu.ar",
    nombre: "Marcos Admin (UNAHUR)",
    rol: "administrador",
    universidad: UNAHUR_UNIVERSIDAD,
  },
  {
    dni: "28000002",
    password: "eval123",
    email: "evaluador@unahur.edu.ar",
    nombre: "Carlos Evaluador",
    rol: "evaluador",
    universidad: UNAHUR_UNIVERSIDAD,
  },
  {
    dni: "42000003",
    password: "ana123",
    email: "ana@belgrano.edu.ar",
    nombre: "Ana Estudiante",
    rol: "estudiante",
    universidad: UNAHUR_UNIVERSIDAD,
    carrera: UNAHUR_CARRERA,
  },
];

// Ana cursó en UNAHUR. Su historial refleja las materias de 1° y 2° año del plan 2025.
const HISTORIAL: Array<{
  usuarioEmail: string;
  materiaNombre: string;
  nota: number;
  fecha: string;
  materiaUniversidad?: string;
  materiaCarrera?: string;
}> = [
  // ── 1° Año · Primer cuatrimestre (CRE del PDF: 3+4+3+6+6 = 22) ──────────────
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Cultura y alfabetización digital en la universidad", nota: 8, fecha: "2023-07-10", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Bioquímica",                                          nota: 7, fecha: "2023-07-12", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Introducción a la Nutrición",                         nota: 9, fecha: "2023-07-14", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Anátomo-Fisiología I",                                nota: 8, fecha: "2023-07-17", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Introducción a la Salud Comunitaria",                 nota: 7, fecha: "2023-07-19", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  // ── 1° Año · Segundo cuatrimestre (CRE: 4+6+6+6+6 = 28) ─────────────────────
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Idioma extranjero",                                   nota: 9, fecha: "2023-12-05", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Anátomo-Fisiología II",                               nota: 7, fecha: "2023-12-07", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Salud Comunitaria I",                                 nota: 8, fecha: "2023-12-10", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Bioquímica Aplicada",                                 nota: 7, fecha: "2023-12-12", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Fundamentos de la Nutrición",                         nota: 9, fecha: "2023-12-14", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  // ── 2° Año · Primer cuatrimestre (CRE: 3+9+5+6+6 = 29) ──────────────────────
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Microbiología",                                       nota: 8, fecha: "2024-07-08", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Salud Comunitaria II",                                nota: 7, fecha: "2024-07-10", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Introducción a la Tecnología de los Alimentos",       nota: 8, fecha: "2024-07-12", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Nutrición en la Infancia y la Adolescencia",          nota: 9, fecha: "2024-07-15", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Técnica en el Manejo de los Alimentos I",             nota: 7, fecha: "2024-07-17", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  // ── 2° Año · Segundo cuatrimestre (CRE: 3+3+9+4+6+6 = 31) ───────────────────
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Psicología",                                          nota: 9, fecha: "2024-12-03", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Antropología",                                        nota: 8, fecha: "2024-12-05", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Salud Comunitaria III",                               nota: 7, fecha: "2024-12-08", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Bromatología y Microbiología de los Alimentos",       nota: 8, fecha: "2024-12-10", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
  { usuarioEmail: "ana@belgrano.edu.ar", materiaNombre: "Técnica en el Manejo de los Alimentos II",            nota: 9, fecha: "2024-12-12", materiaUniversidad: UNAHUR_UNIVERSIDAD, materiaCarrera: UNAHUR_CARRERA },
];

async function seedEmbeddingCache(client: PoolClient): Promise<void> {
  for (const mat of MATERIAS_NUTRICION_UNAHUR) {
    const { rows } = await client.query(
      `SELECT id FROM embedding_cache WHERE nombre = $1`,
      [mat.nombre]
    );
    if (rows.length > 0) continue;

    console.log(`[seed] cache embedding: ${mat.nombre}`);
    const embedding = await embedText(mat.contenido_texto);
    const frases = dividirFrases(mat.contenido_texto);
    const frasesEmbeddings = frases.length > 0 ? await embedBatch(frases) : [];

    await client.query(
      `INSERT INTO embedding_cache (nombre, embedding, frases, frases_embeddings)
       VALUES ($1, $2::vector, $3, $4)
       ON CONFLICT (nombre) DO NOTHING`,
      [
        mat.nombre,
        vectorLiteral(embedding),
        frases,
        frasesEmbeddings.map(vectorLiteral),
      ]
    );
  }
}


export async function runSeed(): Promise<void> {
  console.log("[seed] verificando datos iniciales...");

  // ── FASE 1: universidades + carreras (esqueleto) + usuarios ─────────────────
  // Commit rápido para que el login funcione mientras los embeddings se computan.
  const universidadIds = new Map<string, number>();
  const carreraIds = new Map<string, number>();

  {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const uni of DATA) {
        const u = await client.query(
          `INSERT INTO universidades (nombre) VALUES ($1)
           ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
           RETURNING id`,
          [uni.nombre]
        );
        const uniId = u.rows[0].id;
        universidadIds.set(uni.nombre, uniId);

        for (const car of uni.carreras) {
          const c = await client.query(
            `INSERT INTO carreras (universidad_id, nombre, total_cre, plan_pdf)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (universidad_id, nombre) DO UPDATE SET nombre = EXCLUDED.nombre
             RETURNING id`,
            [uniId, car.nombre, car.total_cre, car.plan_pdf ?? null]
          );
          carreraIds.set(`${uni.nombre}::${car.nombre}`, c.rows[0].id);
        }
      }

      for (const us of USUARIOS) {
        const uniId = us.universidad ? universidadIds.get(us.universidad) ?? null : null;
        const carId = us.universidad && us.carrera ? carreraIds.get(`${us.universidad}::${us.carrera}`) ?? null : null;
        const passwordHash = bcrypt.hashSync(us.password, 10);
        const u = await client.query(
          `INSERT INTO usuarios (dni, password_hash, email, nombre, rol, universidad_id, carrera_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (dni) DO NOTHING
           RETURNING id`,
          [us.dni, passwordHash, us.email, us.nombre, us.rol, uniId, carId]
        );
        if (u.rows.length === 0 && carId) {
          const { rows } = await client.query(`SELECT id FROM usuarios WHERE dni = $1`, [us.dni]);
          if (rows.length > 0) {
            await client.query(`UPDATE usuarios SET carrera_id = $1 WHERE id = $2 AND carrera_id IS NULL`, [carId, rows[0].id]);
          }
        }
      }

      await client.query("COMMIT");
      console.log("[seed] Fase 1 completada: universidades, carreras y usuarios listos");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── FASE 2: embeddings de materias de Belgrano ──────────────────────────────
  // Cada materia en su propia transacción para no bloquear.
  const materiaIds = new Map<string, number>();

  for (const uni of DATA) {
    const uniId = universidadIds.get(uni.nombre)!;
    for (const car of uni.carreras) {
      const carreraId = carreraIds.get(`${uni.nombre}::${car.nombre}`)!;

      const { rows: existingMats } = await query(
        `SELECT nombre, id FROM materias WHERE carrera_id = $1`,
        [carreraId]
      );
      const existingMap = new Map(existingMats.map((r: { nombre: string; id: number }) => [r.nombre, r.id]));

      for (const mat of car.materias) {
        const key = `${uni.nombre}::${car.nombre}::${mat.nombre}`;
        if (existingMap.has(mat.nombre)) {
          materiaIds.set(key, existingMap.get(mat.nombre)!);
          continue;
        }

        console.log(`[seed] embedding: ${uni.nombre} / ${car.nombre} / ${mat.nombre}`);
        const embedding = await embedText(mat.contenido_texto);
        const frases = dividirFrases(mat.contenido_texto);
        const embedsFrases = frases.length > 0 ? await embedBatch(frases) : [];

        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const m = await client.query(
            `INSERT INTO materias (carrera_id, nombre, cre, anio, horas_interaccion, horas_autonomo, contenido_texto, embedding)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector)
             RETURNING id`,
            [carreraId, mat.nombre, mat.cre, mat.anio ?? null, mat.horas_interaccion, mat.horas_autonomo, mat.contenido_texto, vectorLiteral(embedding)]
          );
          if (m.rows.length > 0) {
            const materiaId = m.rows[0].id;
            materiaIds.set(key, materiaId);
            for (let i = 0; i < frases.length; i++) {
              await client.query(
                `INSERT INTO materia_frases (materia_id, indice, frase, embedding)
                 VALUES ($1, $2, $3, $4::vector) ON CONFLICT DO NOTHING`,
                [materiaId, i, frases[i], vectorLiteral(embedsFrases[i])]
              );
            }
          }
          await client.query("COMMIT");
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      }
    }
  }

  // ── FASE 3: historial académico de Ana ──────────────────────────────────────
  {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const usuarioIds = new Map<string, number>();
      for (const us of USUARIOS) {
        const { rows } = await client.query(`SELECT id FROM usuarios WHERE dni = $1`, [us.dni]);
        if (rows.length > 0) usuarioIds.set(us.email, rows[0].id);
      }

      for (const h of HISTORIAL) {
        const usuarioId = usuarioIds.get(h.usuarioEmail);
        const us = USUARIOS.find((x) => x.email === h.usuarioEmail);
        const uniMat = h.materiaUniversidad ?? us?.universidad;
        const carMat = h.materiaCarrera ?? us?.carrera;
        const materiaKey = `${uniMat}::${carMat}::${h.materiaNombre}`;
        const materiaId = materiaIds.get(materiaKey);
        if (!usuarioId || !materiaId) {
          console.warn(`[seed] no se encontró materia para historial: ${materiaKey}`);
          continue;
        }
        await client.query(
          `INSERT INTO historial_academico (usuario_id, materia_id, nota, fecha_aprobacion)
           VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
          [usuarioId, materiaId, h.nota, h.fecha]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── FASE 4: embedding cache de UNAHUR ───────────────────────────────────────
  {
    const client = await pool.connect();
    try {
      await seedEmbeddingCache(client);
    } finally {
      client.release();
    }
  }

  console.log("[seed] Seed completado");
}
