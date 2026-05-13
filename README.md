# CreditPath — MVP

Plataforma web para la gestión de créditos académicos (SACAU/CRE) y solicitudes de equivalencia entre carreras universitarias. Usa embeddings semánticos para sugerir matches entre materias.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Node.js + Express + TypeScript
- **NLP**: Python + FastAPI + sentence-transformers (`paraphrase-multilingual-MiniLM-L12-v2`)
- **DB**: PostgreSQL 16 + pgvector
- **Orquestación**: Docker Compose

## Cómo correr

Requisitos: Docker Desktop (Windows/Mac/Linux) con Compose v2.

```bash
docker-compose up --build
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

| Rol | Email |
|---|---|
| Administrador | `admin@creditpath.ar` |
| Evaluador | `evaluador@litoral.edu.ar` |
| Estudiante | `ana@unstech.edu.ar` |

Login es mock: no pide password, solo el email.

## Flujo end-to-end

1. Login como **estudiante** (`ana@unstech.edu.ar`) → ver historial con 3 materias aprobadas de Ingeniería en Sistemas.
2. Ir a **Solicitar equivalencia** → elegir `Universidad del Litoral` → `Licenciatura en Sistemas de Información` → calcular. El sistema sugiere matches (similitudes > 70% para Algoritmos, Bases de Datos, Programación).
3. Confirmar materias y enviar. Aparece número de trámite `EQ-2026-NNNNNN`.
4. Logout y login como **evaluador** (`evaluador@litoral.edu.ar`) → ver la solicitud en la cola → entrar al detalle → ver comparativa lado a lado de cada par origen/destino → aprobar o rechazar con comentario opcional.
5. Volver como **estudiante** → "Mis solicitudes" → ver el estado actualizado y el comentario del evaluador.

Como **administrador** podés crear universidades, carreras y materias adicionales (con PDF o texto manual). El embedding se genera automáticamente.

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
  -d '{"email":"ana@unstech.edu.ar"}'
```

## Notas

- El seed sólo corre si la tabla `universidades` está vacía. Para reseedear: `docker-compose down -v && docker-compose up --build`.
- El servicio NLP precarga el modelo en build, por lo que el primer `up` toma tiempo pero arranca rápido. El healthcheck del compose hace esperar al backend hasta que el modelo esté listo.
- Auth es JWT firmado con un secret de dev. No usar en producción.

## Fuera de alcance (no incluido en MVP)

- Integración real con SIU Guaraní
- Versionado de planes de estudio
- Exportación PDF al Ministerio
- Notificaciones por email
- Panel del superadministrador
