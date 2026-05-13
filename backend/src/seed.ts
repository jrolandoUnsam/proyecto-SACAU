import { pool, query, vectorLiteral } from "./db";
import { embedText } from "./nlp";

type MateriaSeed = {
  nombre: string;
  cre: number;
  horas_interaccion: number;
  horas_autonomo: number;
  contenido_texto: string;
};

type CarreraSeed = {
  nombre: string;
  total_cre: number;
  materias: MateriaSeed[];
};

type UniversidadSeed = {
  nombre: string;
  carreras: CarreraSeed[];
};

const DATA: UniversidadSeed[] = [
  {
    nombre: "Universidad Tech Nacional",
    carreras: [
      {
        nombre: "Ingeniería en Sistemas",
        total_cre: 240,
        materias: [
          {
            nombre: "Algoritmos y Estructuras de Datos",
            cre: 8,
            horas_interaccion: 96,
            horas_autonomo: 96,
            contenido_texto:
              "Introducción al análisis de algoritmos: complejidad temporal y espacial, notación asintótica O, Omega y Theta. Estructuras de datos lineales: arreglos, listas enlazadas, pilas y colas. Estructuras de datos no lineales: árboles binarios, árboles de búsqueda balanceados (AVL, rojo-negro), grafos. Algoritmos de búsqueda y ordenamiento: búsqueda binaria, quicksort, mergesort, heapsort. Tablas de hash. Recursión y programación dinámica. Algoritmos voraces. Recorridos en grafos: BFS, DFS, caminos mínimos (Dijkstra), árboles de expansión mínima.",
          },
          {
            nombre: "Bases de Datos",
            cre: 8,
            horas_interaccion: 96,
            horas_autonomo: 96,
            contenido_texto:
              "Modelo relacional y álgebra relacional. Diseño conceptual con modelo entidad-relación. Normalización: 1FN, 2FN, 3FN, Boyce-Codd. Lenguaje SQL: DDL, DML, DCL, consultas con joins, subconsultas, agregaciones y funciones de ventana. Transacciones y propiedades ACID. Concurrencia y control de bloqueos. Índices: B-tree, hash, bitmap. Procedimientos almacenados y triggers. Bases de datos no relacionales: documentales (MongoDB), clave-valor (Redis), columnares y de grafos. Introducción a bases de datos distribuidas y replicación.",
          },
          {
            nombre: "Programación I",
            cre: 6,
            horas_interaccion: 72,
            horas_autonomo: 72,
            contenido_texto:
              "Fundamentos de la programación imperativa y estructurada. Variables, tipos de datos primitivos, operadores y expresiones. Estructuras de control: condicionales y bucles. Funciones, parámetros, alcance y recursión. Arreglos y matrices. Cadenas de caracteres. Estructuras de datos básicas: registros y archivos. Introducción a la programación orientada a objetos: clases, objetos, encapsulamiento, herencia y polimorfismo. Manejo de errores y excepciones. Buenas prácticas de codificación y testing unitario.",
          },
          {
            nombre: "Redes de Computadoras",
            cre: 7,
            horas_interaccion: 84,
            horas_autonomo: 84,
            contenido_texto:
              "Modelo OSI y modelo TCP/IP. Capa física y de enlace: Ethernet, conmutación, VLAN. Capa de red: direccionamiento IP, subnetting, ruteo estático y dinámico, protocolos OSPF y BGP. Capa de transporte: TCP y UDP, control de flujo y congestión. Capa de aplicación: HTTP, DNS, SMTP, FTP. Seguridad en redes: firewalls, NAT, VPN, TLS. Redes inalámbricas WiFi 802.11. Introducción a redes definidas por software (SDN) y virtualización de funciones de red.",
          },
          {
            nombre: "Análisis Matemático I",
            cre: 8,
            horas_interaccion: 96,
            horas_autonomo: 96,
            contenido_texto:
              "Funciones de una variable real, dominio e imagen. Límites y continuidad. Derivada: definición, reglas de derivación, regla de la cadena. Aplicaciones de la derivada: máximos y mínimos, gráfica de funciones, optimización. Integral indefinida y definida, teorema fundamental del cálculo. Métodos de integración: por partes, sustitución, fracciones parciales. Aplicaciones de la integral: áreas, volúmenes, longitud de arco. Sucesiones y series numéricas. Series de potencia y Taylor.",
          },
        ],
      },
    ],
  },
  {
    nombre: "Universidad del Litoral",
    carreras: [
      {
        nombre: "Licenciatura en Sistemas de Información",
        total_cre: 230,
        materias: [
          {
            nombre: "Algoritmos y Programación",
            cre: 9,
            horas_interaccion: 108,
            horas_autonomo: 108,
            contenido_texto:
              "Diseño y análisis de algoritmos. Complejidad computacional, notación O. Estructuras de datos: listas, pilas, colas, árboles binarios de búsqueda, árboles balanceados, grafos. Algoritmos de ordenamiento: insertion, quicksort, mergesort, heapsort. Búsqueda binaria. Tablas hash. Recursión, programación dinámica y técnicas voraces. Recorridos de grafos: DFS y BFS. Algoritmos de caminos mínimos y árbol generador mínimo. Implementación en lenguajes orientados a objetos.",
          },
          {
            nombre: "Datos y Bases de Datos",
            cre: 9,
            horas_interaccion: 108,
            horas_autonomo: 108,
            contenido_texto:
              "Modelado conceptual de datos con diagramas entidad-relación. Modelo relacional, álgebra relacional. Normalización hasta forma normal de Boyce-Codd. SQL estándar: definición, manipulación y consulta de datos, joins, subconsultas, vistas, funciones de agregación. Transacciones ACID, control de concurrencia. Optimización de consultas e índices. Procedimientos almacenados, triggers. Introducción a NoSQL: documentos, clave-valor, grafos. Diseño físico y tuning de bases de datos.",
          },
          {
            nombre: "Programación Estructurada",
            cre: 6,
            horas_interaccion: 72,
            horas_autonomo: 72,
            contenido_texto:
              "Conceptos básicos de programación. Variables, tipos de datos, operadores. Estructuras de control: if/else, while, for. Funciones y subrutinas, paso de parámetros por valor y referencia. Arreglos unidimensionales y multidimensionales. Strings. Archivos secuenciales. Modularización y diseño descendente. Introducción al paradigma orientado a objetos. Manejo básico de excepciones. Pruebas unitarias y depuración.",
          },
          {
            nombre: "Telecomunicaciones y Redes",
            cre: 7,
            horas_interaccion: 84,
            horas_autonomo: 84,
            contenido_texto:
              "Arquitecturas de red por capas: OSI y TCP/IP. Medios de transmisión, codificación y modulación. Ethernet y tecnologías LAN, VLANs y conmutación. Direccionamiento IPv4 e IPv6, subneteo, ruteo dinámico (RIP, OSPF). TCP y UDP, control de flujo, congestión y errores. Servicios de aplicación: DNS, HTTP, correo electrónico. Seguridad: cifrado simétrico y asimétrico, TLS, firewalls, redes privadas virtuales. Redes inalámbricas y móviles.",
          },
          {
            nombre: "Cálculo I",
            cre: 8,
            horas_interaccion: 96,
            horas_autonomo: 96,
            contenido_texto:
              "Funciones reales de variable real. Límites de funciones y continuidad. Derivada y sus aplicaciones: optimización, análisis de funciones, regla de L'Hôpital. Integral definida e indefinida, teorema fundamental del cálculo. Técnicas de integración por sustitución, partes y fracciones simples. Aplicaciones al cálculo de áreas y volúmenes de revolución. Introducción a sucesiones y series numéricas.",
          },
        ],
      },
    ],
  },
];

const USUARIOS: Array<{
  email: string;
  nombre: string;
  rol: "estudiante" | "evaluador" | "administrador";
  universidad?: string;
  carrera?: string;
}> = [
  { email: "admin@creditpath.ar", nombre: "Lucía Admin", rol: "administrador" },
  {
    email: "evaluador@litoral.edu.ar",
    nombre: "Carlos Evaluador",
    rol: "evaluador",
    universidad: "Universidad del Litoral",
  },
  {
    email: "ana@unstech.edu.ar",
    nombre: "Ana Estudiante",
    rol: "estudiante",
    universidad: "Universidad Tech Nacional",
    carrera: "Ingeniería en Sistemas",
  },
];

const HISTORIAL: Array<{ usuarioEmail: string; materiaNombre: string; nota: number; fecha: string }> = [
  { usuarioEmail: "ana@unstech.edu.ar", materiaNombre: "Algoritmos y Estructuras de Datos", nota: 8, fecha: "2024-12-10" },
  { usuarioEmail: "ana@unstech.edu.ar", materiaNombre: "Bases de Datos", nota: 9, fecha: "2025-07-15" },
  { usuarioEmail: "ana@unstech.edu.ar", materiaNombre: "Programación I", nota: 7, fecha: "2024-07-20" },
];

export async function runSeed(): Promise<void> {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM universidades");
  if (rows[0].n > 0) {
    console.log("[seed] base ya tiene datos, salteando seed");
    return;
  }
  console.log("[seed] insertando datos iniciales...");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const universidadIds = new Map<string, number>();
    const carreraIds = new Map<string, number>();
    const materiaIds = new Map<string, number>();

    for (const uni of DATA) {
      const u = await client.query(
        "INSERT INTO universidades (nombre) VALUES ($1) RETURNING id",
        [uni.nombre]
      );
      universidadIds.set(uni.nombre, u.rows[0].id);

      for (const car of uni.carreras) {
        const c = await client.query(
          "INSERT INTO carreras (universidad_id, nombre, total_cre) VALUES ($1, $2, $3) RETURNING id",
          [u.rows[0].id, car.nombre, car.total_cre]
        );
        carreraIds.set(`${uni.nombre}::${car.nombre}`, c.rows[0].id);

        for (const mat of car.materias) {
          console.log(`[seed] embedding: ${uni.nombre} / ${car.nombre} / ${mat.nombre}`);
          const embedding = await embedText(mat.contenido_texto);
          const m = await client.query(
            `INSERT INTO materias (carrera_id, nombre, cre, horas_interaccion, horas_autonomo, contenido_texto, embedding)
             VALUES ($1, $2, $3, $4, $5, $6, $7::vector) RETURNING id`,
            [
              c.rows[0].id,
              mat.nombre,
              mat.cre,
              mat.horas_interaccion,
              mat.horas_autonomo,
              mat.contenido_texto,
              vectorLiteral(embedding),
            ]
          );
          materiaIds.set(`${uni.nombre}::${car.nombre}::${mat.nombre}`, m.rows[0].id);
        }
      }
    }

    const usuarioIds = new Map<string, number>();
    for (const us of USUARIOS) {
      const uniId = us.universidad ? universidadIds.get(us.universidad) ?? null : null;
      const carId = us.universidad && us.carrera ? carreraIds.get(`${us.universidad}::${us.carrera}`) ?? null : null;
      const u = await client.query(
        `INSERT INTO usuarios (email, nombre, rol, universidad_id, carrera_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [us.email, us.nombre, us.rol, uniId, carId]
      );
      usuarioIds.set(us.email, u.rows[0].id);
    }

    for (const h of HISTORIAL) {
      const usuarioId = usuarioIds.get(h.usuarioEmail);
      const ana = USUARIOS.find((x) => x.email === h.usuarioEmail);
      const materiaKey = `${ana?.universidad}::${ana?.carrera}::${h.materiaNombre}`;
      const materiaId = materiaIds.get(materiaKey);
      if (!usuarioId || !materiaId) continue;
      await client.query(
        `INSERT INTO historial_academico (usuario_id, materia_id, nota, fecha_aprobacion)
         VALUES ($1, $2, $3, $4)`,
        [usuarioId, materiaId, h.nota, h.fecha]
      );
    }

    await client.query("COMMIT");
    console.log("[seed] Seed completado");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
