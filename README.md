# CreditPath — MVP

Plataforma web para la gestión de créditos académicos (SACAU/CRE) y solicitudes de equivalencia entre carreras universitarias. Usa embeddings semánticos para sugerir matches entre materias.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Node.js + Express + TypeScript
- **NLP**: Python + FastAPI + sentence-transformers (`paraphrase-multilingual-mpnet-base-v2`)
- **DB**: PostgreSQL 16 + pgvector
- **Orquestación**: Docker Compose

## Cómo correr

Requisitos: Docker Desktop (Windows/Mac/Linux) con Compose v2.

```bash
docker compose up --build
```

Primer build: ~5 minutos (descarga del modelo NLP, ~500 MB).

Cuando termine, el backend imprime `[backend] Seed completado` y `[backend] Listening on 4000`.

Abrir: **http://localhost:3000**

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| NLP | http://localhost:8000 |
| Postgres | localhost:5432 (user/db/pass = `creditpath`) |

## Usuarios demo (pre-cargados)

Login con **DNI + contraseña**.

| Rol | DNI | Contraseña | Nombre |
|---|---|---|---|
| Administrador UNAHUR | `30000002` | `admin123` | Marcos Admin (UNAHUR) |
| Administrador Belgrano | `30000001` | `admin123` | Patricia Admin (Belgrano) |
| Evaluador | `28000002` | `eval123` | Carlos Evaluador |
| Estudiante | `42000003` | `ana123` | Ana Estudiante |

## Estado inicial del sistema

Al arrancar, el seed carga:

- **Universidad de Belgrano** — Licenciatura en Nutrición completa (39 materias con embeddings).
- **UNAHUR** — universidad creada pero sin carrera ni materias: el admin la carga subiendo el PDF.
- **Ana** — estudiante asociada a UNAHUR, sin historial hasta que el admin sube el PDF.

## Flujo end-to-end (demo)

### 1. Admin sube el plan de estudios de UNAHUR

Login como **Marcos Admin (UNAHUR)** → *Subir carrera* → seleccionar `Licenciatura-en-Nutricion_Hurlingham.pdf` → *Subir y procesar PDF*.

El sistema extrae las materias del PDF, genera los embeddings (usa caché pre-computada: es instantáneo) y carga el historial académico de Ana con 20 materias aprobadas de 1° y 2° año.

### 2. Estudiante solicita equivalencias

Login como **Ana Estudiante** → *Mi historial* → ver 20 materias aprobadas de UNAHUR Nutrición.

Ir a *Solicitar equivalencia* → elegir **Universidad de Belgrano** → **Licenciatura en Nutrición** → calcular. El sistema sugiere pares de materias con similitud semántica alta (Bioquímica, Anátomo-Fisiología, Nutrición, etc.).

Confirmar las materias a pedir y enviar. Aparece el número de trámite `EQ-2026-NNNNNN`.

### 3. Evaluador resuelve

Login como **Carlos Evaluador** → *Solicitudes pendientes* → entrar al detalle → ver comparativa lado a lado de cada par origen/destino con similitud calculada → aprobar, rechazar o aprobar parcialmente con nota y comentario por ítem.

### 4. Estudiante ve el resultado

Volver como **Ana** → *Mi historial* → las materias equivalidas aparecen junto a las de UNAHUR, con nota y tipo "Equivalencia".

## Estructura

```
.
├── docker-compose.yml
├── db/init/01_schema.sql       # esquema PostgreSQL + pgvector
├── nlp/                        # FastAPI + sentence-transformers
├── backend/                    # Node + Express + TS
└── frontend/                   # React + Vite + Tailwind
```

## Smoke tests

```bash
# NLP
curl http://localhost:8000/health

# Backend
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"dni":"42000003","password":"ana123"}'
```

## Notas

- El seed solo corre si la tabla `universidades` está vacía. Para resetear: `docker compose down -v && docker compose up --build`.
- El servicio NLP precarga el modelo en build; el primer `up` tarda pero arranca rápido. El healthcheck del compose hace esperar al backend hasta que el modelo esté listo.
- Auth es JWT firmado con un secret de dev. No usar en producción.

## Fuera de alcance (no incluido en MVP)

- Integración real con SIU Guaraní
- Versionado de planes de estudio
- Exportación PDF al Ministerio
- Notificaciones por email
- Panel del superadministrador
