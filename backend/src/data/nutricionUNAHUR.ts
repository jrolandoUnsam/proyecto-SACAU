// Datos reales de la Licenciatura en Nutrición de la Universidad Nacional de
// Hurlingham (UNAHUR), extraídos del plan de estudios 2025 (PDF en public/).
// CRE y horas salen de la tabla "Estructura del plan de estudio" (HIT = horas de
// interacción totales, HTAT = horas de trabajo autónomo totales). Los contenidos
// provienen de la sección 10 "Contenidos mínimos".

export interface MateriaUNAHUR {
  nombre: string;
  cre: number;
  anio: number;
  horas_interaccion: number; // HIT
  horas_autonomo: number; // HTAT
  contenido_texto: string;
}

export const UNAHUR_UNIVERSIDAD = "Universidad Nacional de Hurlingham";
export const UNAHUR_CARRERA = "Licenciatura en Nutrición";
export const UNAHUR_TOTAL_CRE = 300;
export const UNAHUR_PLAN_PDF = "Licenciatura-en-Nutricion.pdf";

export const MATERIAS_NUTRICION_UNAHUR: MateriaUNAHUR[] = [
  {
    nombre: "Cultura y alfabetización digital en la universidad",
    cre: 3,
    anio: 1,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Derechos y ciudadanía digital. Reflexión crítica sobre la cultura contemporánea. Entornos y plataformas digitales de aprendizaje. Herramientas de colaboración en ambientes digitales. Recursos de información en la era digital: búsquedas efectivas y evaluación crítica de fuentes. Producción, uso y distribución de contenidos digitales académicos. Exploración y apropiación de tendencias y tecnologías emergentes. Uso de tecnologías de la información y la comunicación en la práctica profesional.",
  },
  {
    nombre: "Bioquímica",
    cre: 4,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 36,
    contenido_texto:
      "La química estructural de los componentes de la materia viva y la función biológica con la estructura química. Bioquímica y nutrición. Química general, el agua, glúcidos, lípidos, aminoácidos, proteínas y nucleoproteínas. Termodinámica. Introducción al metabolismo. Compuestos inorgánicos y orgánicos. Biomoléculas estructura y función. Bases moleculares.",
  },
  {
    nombre: "Introducción a la Nutrición",
    cre: 3,
    anio: 1,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Conceptos generales de la Nutrición. Nutrientes aportados por alimentos protectores. Alimentos fuentes y sus respectivos nutrientes. Leyes fundamentales de la alimentación. Requerimientos y recomendaciones nutricionales. Macronutrientes. Funciones de los Hidratos de carbono. Calidad y cantidad de proteínas. Necesidades de proteínas. Micronutrientes y Agua. Valoración del estado nutricional. Sistema de clasificación NOVA. Guías Alimentarias para la Población Argentina (GAPA). Programas Nutricionales. Consideraciones nutricionales en estados fisiológicos normales y fisiopatológicos. Alimentación enteral y parenteral. Interacciones entre medicamentos y alimentos.",
  },
  {
    nombre: "Anátomo-Fisiología I",
    cre: 6,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Introducción a la Anatomía microscópica y macroscópica. Niveles de organización del cuerpo humano: Biología celular. Conceptos para el estudio de la morfología macroscópica, microscópica y la fisiología. Técnicas de estudio, Planimetría y nomenclatura. Regiones topográficas. Concepto de célula y tejido; sistemas y aparatos. Distintos tipos de epitelios, tejido conectivo: tipos y funciones. Desarrollo embriológico: desarrollo y crecimiento. Aparato Respiratorio: células y órganos, movimientos ventilatorios. Aparato cardiovascular: el corazón como bomba, circulación arterial y venosa. Aparato digestivo: células y órganos; funciones. Organización general del tubo digestivo. Aparato locomotor: componentes.",
  },
  {
    nombre: "Introducción a la Salud Comunitaria",
    cre: 6,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Salud Comunitaria: concepto, características. Promoción de la Salud: concepto, declaraciones de las conferencias internacionales. La salud como derecho humano. Distintos enfoques del concepto de salud. El proceso de trabajo en salud. Estado: perspectivas teóricas, modelos de Estado y desarrollo histórico en Argentina. Procesos de desigualdad. El conflicto social. El Estado, lo político en las políticas públicas. La Atención Primaria de la Salud: ventajas y riesgos de la APS. La APS como estrategia integrada a un sistema de salud. La perspectiva de género y la salud: sexo y género como construcciones sociales.",
  },
  {
    nombre: "Idioma extranjero",
    cre: 4,
    anio: 1,
    horas_interaccion: 32,
    horas_autonomo: 68,
    contenido_texto:
      "Conocimiento del idioma extranjero: inglés o portugués en el nivel de comprensión de textos.",
  },
  {
    nombre: "Anátomo-Fisiología II",
    cre: 6,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Aparato genitourinario, vías naturales de acceso. Sistema reproductor femenino. Órganos reproductores femeninos: control hormonal del ovario, diferenciación sexual, fecundación. Sistema Urinario y aparato reproductor masculino. Líquidos orgánicos y excreción de orina. Sistema nervioso central y periférico, órganos y vías piramidal y extrapiramidal, vías del dolor; centro respiratorio. Inmunidad: células de la inmunidad, circulación linfática. Médula espinal: configuración externa e interna. Vías de conducción nerviosa. Reflejos medulares. Bulbo y Protuberancia: centros autonómicos. El cerebro.",
  },
  {
    nombre: "Salud Comunitaria I",
    cre: 6,
    anio: 1,
    horas_interaccion: 70,
    horas_autonomo: 80,
    contenido_texto:
      "Intervención comunitaria: problematización y definición de los problemas. Los trabajadores comunitarios de la salud como investigadores. Análisis situacional. Mapeo socio comunitario. Educación en salud: concepto, definición y modelos. Procedimientos en educación para la salud, métodos y medios. Agentes y ámbitos para la educación para la salud. Programas de intervención en las distintas etapas de la vida. Fundamentos de la Educación Popular. Interculturalidad: el concepto de cultura en el proceso salud-enfermedad-atención-cuidado. La epidemiología como herramienta de la salud pública. Metodología de la Investigación en salud. Delimitación y formulación de problemas de investigación.",
  },
  {
    nombre: "Bioquímica Aplicada",
    cre: 6,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "El metabolismo, reacciones químicas que se producen en la materia viva: metabolismo de los glúcidos, proteínas y lípidos. El metabolismo de bases nitrogenadas, oligoelementos, minerales y vitaminas liposolubles e hidrosolubles. Vías metabólicas. La química de los procesos y las sustancias que almacenan y transmiten información biológica. Enzimas y biomembranas. Bioquímica de la contracción muscular.",
  },
  {
    nombre: "Fundamentos de la Nutrición",
    cre: 6,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Vitaminas, minerales y oligoelementos: biodisponibilidad, requerimientos, recomendaciones, funciones, alimentos fuente. Vitaminas: concepto, clasificación, propiedades, fuentes. Deficiencias de vitaminas y minerales. Biodisponibilidad de nutrientes. Plan de Alimentación en adultos sanos: Anamnesis Alimentaria, Fórmula Sintética, Caracteres del Régimen, Fórmula Desarrollada, lista diaria de alimentos, selección de alimentos, formas de preparación, distribución diaria, equivalencias, ideas de menú, reemplazos. Bases fisiológicas y metabólicas de la utilización de los nutrientes a lo largo de las etapas de la vida. Plan de alimentación específico para adultos mayores.",
  },
  {
    nombre: "Microbiología",
    cre: 3,
    anio: 2,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Principios de la microbiología aplicados a las normas que rigen los procedimientos del rol profesional para proteger a las personas con enfermedades infectocontagiosas. Definición y clasificación de agentes microbiológicos: priones, virus, bacterias, hongos, parásitos. Bioseguridad en el ámbito de salud. Factores de riesgo. Infección asociada al cuidado de la salud. Conceptos y métodos de esterilización, desinfección y antisepsia. Residuos hospitalarios. Procesos de recolección de muestras microbiológicas. Microbiología de las infecciones asociadas al cuidado de la salud. Inmunología básica: antígenos, anticuerpos, inmunidad.",
  },
  {
    nombre: "Salud Comunitaria II",
    cre: 9,
    anio: 2,
    horas_interaccion: 100,
    horas_autonomo: 125,
    contenido_texto:
      "Derecho a la Salud. La salud como cuestión pública desde la perspectiva de derechos humanos. Las condiciones de vida como determinantes sociales de la salud. Salud mental como parte de las políticas sociales. Herramientas de trabajo: entrevista y observación. Construcción de la subjetividad. Género y salud: diferencias y desigualdades. Comunidad y familia como unidades de atención. Promoción de la salud (entornos y estilos de vida saludables). Intersectorialidad. Enfoque interdisciplinario. Concepto de Red. Redes en salud: modelos. Comunicación Social en el proceso salud-enfermedad-atención-cuidado.",
  },
  {
    nombre: "Introducción a la Tecnología de los Alimentos",
    cre: 5,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "La importancia del agregado de valor a materias primas mediante la aplicación de conocimiento y tecnología. Industria alimenticia y desarrollo nacional. Historia. La industria alimenticia y los diferentes modelos económicos, productivos y sociales. Funciones de los distintos niveles profesionales involucrados. Principales industrias alimentarias. La industria alimentaria y la conservación del medio ambiente. Evolución y perspectivas de la industria alimentaria a escala nacional, regional y mundial. Visitas a establecimientos.",
  },
  {
    nombre: "Nutrición en la Infancia y la Adolescencia",
    cre: 6,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Proceso de cuidado alimentario nutricional en las distintas etapas de la vida. Nutrición durante el embarazo y la lactancia: requerimientos especiales y nutrientes. Crecimiento y nutrición prenatal. Crecimiento y desarrollo. Gráficas de crecimiento e instrumentos de medición. Evaluación del crecimiento y evaluación nutricional en pediatría. Alimentación del lactante, lactancia materna. Fisiología digestiva, maduración. Alimentación complementaria. Requerimientos y recomendaciones nutricionales en la etapa preescolar, escolar y adolescente. Plan alimentario. Metabolismo de micro y macronutrientes.",
  },
  {
    nombre: "Técnica en el Manejo de los Alimentos I",
    cre: 6,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Clasificación, composición y características físicas y químicas de los alimentos. Criterio cuantitativo en la preparación de alimentos. Técnicas de medición y cuantificación. Peso y volumen. Tipos de recetas. Operaciones fundamentales mecánicas, físicas, químicas y biológicas sobre los alimentos. Sistemas alimentarios. Modificaciones de los alimentos según el tratamiento. Bases físico-químicas para el manejo de los alimentos. Mecanismos de transferencia calórica. Evaluación sensorial de los alimentos. Agua. Azúcares. Cereales y legumbres, almidones, harinas, gluten, pastas.",
  },
  {
    nombre: "Psicología",
    cre: 3,
    anio: 2,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Práctica Disciplinar, Multidisciplinar e Interdisciplinar. Psicopatología. Conceptos básicos. Exploración psicopatológica. Alteración de las funciones mentales. Diferenciación entre construcción de subjetividad y construcción del sujeto. Psicoanálisis: una nueva epistemología de lo normal-patológico. Transferencia. Subjetividad e intersubjetividad. Sexualidad: pulsión, deseo, libido. Fases del desarrollo psicosexual. Complejo de Edipo. Periodo de latencia, sublimación. Pubertad y adolescencia. Construcción de la identidad, duelos. Adultez, mediana edad, vejez. El rol de la Psicología en la Salud Comunitaria.",
  },
  {
    nombre: "Antropología",
    cre: 3,
    anio: 2,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "La Antropología como ciencia: sus orígenes y sus vínculos con otras disciplinas. La influencia de las principales corrientes teóricas. Concepción histórica y cultural del sujeto. Etnias y etnocentrismo, diferencias culturales y desigualdad social. Genealogía del racismo. Cultura y sociedad. Naturaleza y Cultura. Las culturas en nuestro país y en Latinoamérica. Transculturación e inmigración. Género como dimensión transversal. Diversidad cultural en salud: estudios de creencias, saberes, racionalidades y prácticas curativas. Estrategias para una perspectiva intercultural en el ejercicio profesional en salud.",
  },
  {
    nombre: "Salud Comunitaria III",
    cre: 9,
    anio: 2,
    horas_interaccion: 100,
    horas_autonomo: 125,
    contenido_texto:
      "Epidemiología: concepto, definición, evolución histórica y aportes. Causalidad, concepto de riesgo, factor de riesgo, susceptibilidad y vulnerabilidad. Indicadores epidemiológicos. Aplicaciones de la epidemiología. Diagnóstico de necesidades de salud de la comunidad y vigilancia epidemiológica. Sistemas de información en salud. Sistemas de vigilancia de la situación alimentario-nutricional. Medidas epidemiológicas: de frecuencia, de asociación, de impacto. Estudio de brote. El Conocimiento y el Método Científico. Investigación en salud. La investigación disciplinar: propósitos y valor del método científico. Políticas de investigación.",
  },
  {
    nombre: "Bromatología y Microbiología de los Alimentos",
    cre: 4,
    anio: 2,
    horas_interaccion: 48,
    horas_autonomo: 52,
    contenido_texto:
      "Bromatología analítica, división de la bromatología. Alimento. Caracterización fisicoquímica de alimentos. Aditivos y coadyuvantes. Calidad de alimentos. Análisis bromatológico. Bromatología de aguas. Microorganismos patogénicos perjudiciales y beneficiosos en alimentos. Inactivación y eliminación de microorganismos en alimentos. Principios de la microbiología y parasitología humana y su relación con la nutrición. Gestión de la inocuidad alimentaria y normas de bioseguridad. Enfermedades transmitidas por alimentos. Métodos de análisis de alimentos. Características de los principales grupos de alimentos: lácteos, farináceos, aceites y grasas.",
  },
  {
    nombre: "Técnica en el Manejo de los Alimentos II",
    cre: 6,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Sistemas alimentarios. Operaciones fundamentales mecánicas, físicas, químicas y biológicas sobre los alimentos. Productos de Panificación. Productos de pastelería, tipos de agentes leudantes. Grasas y aceites. Leche y productos lácteos. Huevo y espumas. Carnes. Vegetales, frutas. Conceptos y características de cada grupo de alimentos. Modificaciones por métodos de cocción y preparación. Manipulación. Estabilidad. Formas de preparación. Infusiones. Condimentos. Características sensoriales.",
  },
  {
    nombre: "PPS: Prácticas en Nutrición Comunitaria y Gestión I",
    cre: 6,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Aplicación de conceptos de salud comunitaria e interdisciplina. Las edades de la vida: infancia, adolescencia, juventud, adultez, adultez mayor. Aplicación de los conocimientos adquiridos de nutrición para la población sin patologías. Intervención y realización de acciones de promoción de la salud y prevención primaria, secundaria y rehabilitación. Integración de diferentes niveles de acciones socio-comunitarias, aspectos nutricionales en las diferentes edades de la vida. Situaciones especiales: el embarazo.",
  },
  {
    nombre: "Ética y Desarrollo Profesional",
    cre: 3,
    anio: 3,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Derechos Humanos: concepto, perspectiva socio-cultural e historicidad. La Declaración Universal de los Derechos Humanos. Tratados internacionales incorporados en la Constitución Nacional Argentina. Perspectiva ética para el análisis de los derechos humanos. Nociones de teorías de justicia. Bioética: concepto, principios. Problemas éticos de la relación usuario-sistema de salud. Comité de ética en el campo asistencial. La argumentación bioética como proceso deliberativo. Ética e investigación con sujetos humanos. Aspectos legales de la investigación científica. Integridad de la investigación.",
  },
  {
    nombre: "Salud Comunitaria IV",
    cre: 9,
    anio: 3,
    horas_interaccion: 96,
    horas_autonomo: 129,
    contenido_texto:
      "La gestión y sus componentes. El proceso de gestión y administración. Estructura hospitalaria y servicios. Centro de salud comunitario: estructura, funciones, recursos, programas, actividades y registros. La dirección. Proceso de toma de decisiones. Liderazgo. Auditoría. La planificación como herramienta de gestión. Niveles operacionales: plan, programa, proyecto. La gestión en salud comunitaria. Planificación estratégica situacional a partir de los problemas de la comunidad. El proceso de investigación. Elaboración de proyectos. Problemas prevalentes de salud y cuidados en el abordaje territorial. Nutrición y problemas vinculados con la alimentación.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia de la persona adulta I",
    cre: 6,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "El sistema neuroendócrino: hipotálamo, hipófisis y sistema endocrino. Aplicación del tratamiento nutricional en el marco de un proceso fisiopatológico. Métodos de evaluación nutricional: determinación de factores nutricionales adversos, valoración global subjetiva, valoración nutricional objetiva. Diagnóstico clínico nutricional y determinación de requerimientos nutricionales. Bases fisiopatológicas de las enfermedades relacionadas con la nutrición. Fisiopatología de los sistemas y aparatos del organismo. Características del plan de alimentación. Abordaje nutricional según la fisiopatología y el diagnóstico del estado nutricional. Relación profesional–paciente. Equipo terapéutico.",
  },
  {
    nombre: "Evaluación Nutricional",
    cre: 6,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Medición del estado de salud de la población. Indicadores de salud, alimentación, nutrición y socioeconómicos. Clasificación, componentes y objetivos de la Evaluación Nutricional. Abordaje individual y poblacional. Indicadores, metodologías e instrumental de la evaluación nutricional a lo largo del ciclo vital: Evaluación Alimentaria, Antropométrica y osteología, Bioquímica y Clínica. Elaboración, interpretación y presentación de resultados. Requerimientos y necesidades nutricionales según organismos nacionales e internacionales. Monitoreo y seguimiento nutricional. Encuestas y estudios alimentarios: cualitativos y cuantitativos. Perfiles nutricionales.",
  },
  {
    nombre: "PPS: Prácticas en Nutrición Comunitaria y Gestión II",
    cre: 6,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "El centro de Atención Primaria de la Salud integrado a la comunidad. Concepto de referencia y contrarreferencia, búsqueda activa, oportunidad. Diagnóstico de situación alimentario-nutricional de la comunidad y de grupos vulnerables. Desarrollo de habilidades para trabajar como miembro de un equipo interdisciplinario. Actualización bibliográfica y planteo investigativo socio-sanitario basado en problema, evaluación de las intervenciones realizadas.",
  },
  {
    nombre: "Farmacología",
    cre: 3,
    anio: 3,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Farmacología: concepto de droga, fármaco o medicamento. Farmacocinética. Absorción, distribución, metabolismo y eliminación de fármacos. Transferencia de los fármacos a través de las membranas. Biodisponibilidad. Farmacodinamia. Mecanismo de acción de los fármacos. Curvas dosis-respuesta. Vías de administración. Principales grupos farmacológicos. Uso Racional de Medicamentos. Efectos adversos. Interacciones farmacológicas. Interacción alimentos/fármacos. Reacciones adversas a medicamentos (RAM). Farmacovigilancia. Urgencias toxicológicas. Automedicación.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia de la persona adulta II",
    cre: 5,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Fisiopatología de los sistemas y aparatos del organismo. Fundamentos e instrumentos del plan de alimentación en cada situación fisiopatológica. Características del cuidado nutricional e indicación del plan alimentario. Soporte nutricional. Alimentación por vías de excepción. Fisiopatología y dietoterapia de las enfermedades carenciales, por exceso y metabólicas. Dietoterapia en tratamientos quirúrgicos. Valoración nutricional en el paciente crítico. Soporte nutricional enteral y parenteral. Fisiopatología y dietoterapia de las enfermedades del aparato digestivo, orofaríngeas, patologías respiratorias, cáncer e inmunidad.",
  },
  {
    nombre: "Técnica Dietoterápica I",
    cre: 5,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Técnica dietoterápica: concepto y definición, características generales que requiere la alimentación en diferentes situaciones de enfermedad. Diferencias técnicas y químicas entre técnica dietética y técnica dietoterápica. Desarrollo de la técnica, magnitudes. Densidad Energética. Elementos químicos, vitaminas. Consistencia. Selección de nutrientes, alimentos, productos alimenticios, y modificaciones físicas y/o químicas y/o sensoriales en los sistemas alimentarios (preparaciones) para adaptarlos a distintas situaciones fisiopatológicas carenciales y por exceso.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia en la Infancia y la Adolescencia",
    cre: 7,
    anio: 3,
    horas_interaccion: 96,
    horas_autonomo: 79,
    contenido_texto:
      "Valoración Nutricional del Niño Enfermo. Deshidratación, balance hidroelectrolítico, shock hipovolémico. Desnutrición. Raquitismo. Escorbuto. Fisiología, fisiopatología y manejo dietoterápico en síndromes diarreicos. Anemias Nutricionales. Diarreas crónicas y agudas. Enfermedad Celíaca. Enfermedad Fibroquística del Páncreas. Obesidad y sobrepeso. Dislipemias. Diabetes. Hipertensión. Reflujo Gastroesofágico. Patologías Hepáticas y Cardíacas. Insuficiencia renal. Síndrome Urémico Hemolítico. Fenilcetonuria. Tratamiento Nutricional y Plan de Alimentación en las diferentes situaciones fisiopatológicas. Pacientes inmunosuprimidos y oncológicos.",
  },
  {
    nombre: "Economía y Producción Regional de Alimentos",
    cre: 5,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Modelos de política económica alimentaria. Desarrollo de la cadena de valor alimentaria. Producción y comercialización de alimentos. Sistemas productivos y sistemas agroalimentarios. Regiones productivas y conformación socioeconómica agropecuaria. Producción frutihortícola, lácteos, oleaginosas, producciones regionales. Procesos productivos y su relación con la Seguridad y Soberanía alimentaria. Microeconomía: demanda, oferta y equilibrio, análisis de mercado de alimentos en Argentina. Macroeconomía: problemas económicos principales, mediciones de precios, composición del gasto. Canastas de alimentos. Canales de comercialización. Biocombustibles.",
  },
  {
    nombre: "Salud Comunitaria V",
    cre: 9,
    anio: 4,
    horas_interaccion: 96,
    horas_autonomo: 129,
    contenido_texto:
      "Salud ambiental. Determinantes ambientales de la salud. Contaminación ambiental: tipos e impacto. Agenda 2030 de las Naciones Unidas para el Desarrollo Sustentable. Estrategia internacional 'One Health' (Una Salud). Calentamiento global. Derecho a la salud y marco jurídico en la Argentina. Problemas éticos de la relación usuario-sistema de salud: confidencialidad, veracidad, consentimiento informado. Comités de ética hospitalarios. Perspectiva de género y derecho a la salud. El proyecto de intervención comunitaria en Salud. Asesoría en el cuidado de la salud a nivel individual, familiar y comunitario. Mecanismos de participación, organización y gestión.",
  },
  {
    nombre: "Educación Alimentaria y Nutricional",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Educación alimentaria y nutricional en el contexto de la educación para la salud. La salud: un derecho y una responsabilidad individual y social. Relación entre salud-alimentación y los derechos humanos. Prevención de la enfermedad y promoción de la salud (Carta de Ottawa). Principios básicos de la Educación Alimentaria y Nutricional (EAN). Cultura alimentaria, hábitos alimentarios saludables. Creencias, mitos y tabúes. Momentos pedagógicos de una intervención educativa. Participación comunitaria. Metodologías participativas: juegos pedagógicos. Consejería alimentario-nutricional. Guías alimentarias. Rotulado y etiquetado nutricional de los alimentos.",
  },
  {
    nombre: "Técnica Dietoterápica II",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Compuestos orgánicos de los alimentos. Sistemas controlados en macronutrientes: hidratos de carbono, proteínas y lípidos. Fibras en la alimentación. Principios básicos para la utilización y adecuación de productos nutroterápicos y alimentación enteral. Selección de nutrientes, alimentos, productos alimenticios y modificaciones físicas y/o químicas y/o sensoriales en los sistemas alimentarios (preparaciones) para adaptarlos a distintas situaciones fisiopatológicas metabólicas y gastrointestinales. Alimentos funcionales.",
  },
  {
    nombre: "Psicología aplicada a la Nutrición",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Aporte de la psicología al análisis de los problemas nutricionales. La complejidad del acto alimentario. Factores sociales, económicos, culturales y psicológicos que intervienen en la adquisición de hábitos alimentarios. La familia como unidad básica. Salud mental, salud familiar. Teoría del apego, afectos, desarrollo emocional. Desarrollo humano: ciclo vital humano. Adolescencia: trastornos de la conducta alimentaria, depresión, bulimia, anorexia, obesidad. Neurobiología de la alimentación. Interdisciplina, multidisciplina y transdisciplina. Dispositivos de acompañamiento, trabajos de grupo.",
  },
  {
    nombre: "Fundamentos de los diferentes patrones de alimentación",
    cre: 3,
    anio: 4,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Proceso de cuidado alimentario nutricional de acuerdo con diversos patrones alimentarios en las distintas etapas de la vida. Clasificación de la alimentación vegetariana. Fundamentos, principios y generalidades. Nutrientes críticos en los diferentes momentos biológicos. Recomendaciones y requerimientos nutricionales. Fundamentos del plan alimentario: diseño de un plan alimentario, requerimiento energético, fórmula sintética, fórmula desarrollada y distribución de alimentos. Técnicas culinarias. Fundamentos y principios de nuevas tendencias en la alimentación. Plan de alimentación aplicado a diferentes patrones alimentarios.",
  },
  {
    nombre: "Historia Sociosanitaria de la Salud",
    cre: 6,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 86,
    contenido_texto:
      "Introducción a la historiografía social: antecedentes del vínculo entre Historia, sociología y economía. Movimientos populares en Latinoamérica. La medicina en la historia de la República Argentina: el protomedicato y la medicina popular. Las epidemias del siglo XIX. De la Caridad a la seguridad social. Informe Bialet Massé. La creación del Ministerio de Salud de la Nación: Ramón Carrillo y la planificación en salud. La Fundación Eva Perón. La Epidemia de Polio. La Ley Oñativia. La creación de las obras sociales y del PAMI. La salud en la democracia. Las tecnologías y la financiación de la Salud.",
  },
  {
    nombre: "Gestión y Administración de los Servicios de Alimentación",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Administración y gestión de servicios de alimentación y nutrición en instituciones y organizaciones: dirección, organización, planificación, supervisión, evaluación y auditoría. El pensamiento administrativo. La toma de decisiones. Niveles de organización de los servicios. Planificación estratégica en los servicios de alimentación. Administración de recursos. Selección, formación y capacitación de recursos humanos. Costos y presupuesto. Contrataciones y compras. Sustentabilidad. Reducción de pérdidas y desperdicio de alimentos. Normas de bioseguridad y sistemas de calidad. Sistema de peligros y puntos críticos de control (HACCP). Sistemas de gestión de la calidad e inocuidad (ISO 9000 y 22000).",
  },
  {
    nombre: "Tecnología e Investigación en el desarrollo de los alimentos",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Investigación y desarrollo industrial de productos. Creación de productos e ingredientes. Análisis del comportamiento de los consumidores y sus factores condicionantes. Normativas reguladoras de la publicidad, rotulado y producción de alimentos. Rol de la Industria Alimentaria en la salud de la población. Elaboración de un proyecto para la creación de nuevos productos alimenticios: generación de ideas, concepto de producto, diseño y desarrollo del proceso y del envase, estrategia de mercado, plan de marketing y de producción, análisis financiero, lanzamiento y evaluación post-lanzamiento. Nanotecnología, Biotecnología, Alimentos Funcionales. Legislación y marcos regulatorios de alimentos.",
  },
  {
    nombre: "Estadística y análisis de datos en ciencias de la salud",
    cre: 5,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Fundamentos del cálculo de probabilidades. Conceptos de universo, población y muestra. Técnicas de muestreo. Matriz de datos. Estadística descriptiva. Clasificación de las variables y escalas. Medidas de resumen: posición, dispersión, tendencia central. Distribución Gaussiana. Estadística inferencial. Teorema del Límite Central. Test de hipótesis. Estimación de parámetros. Intervalos de confianza. Análisis de la varianza. Análisis univariado y multivariado. Análisis de correlación y regresión lineal y múltiple. Estadísticas poblacionales y sanitarias. Indicadores demográficos y socioeconómicos. Aplicación de la bioestadística en el ejercicio profesional.",
  },
  {
    nombre: "PPS: Práctica en la Industria Alimentaria I",
    cre: 7,
    anio: 4,
    horas_interaccion: 96,
    horas_autonomo: 79,
    contenido_texto:
      "Se desarrolla en sectores productivos y/o proyectos concretos bajo supervisión docente. Aplicación de principios básicos de la nutrición relevantes para la formulación y desarrollo de productos alimentarios en la industria. Implementación de normas y regulaciones sobre seguridad alimentaria, incluyendo HACCP (Análisis de Peligros y Puntos Críticos de Control), Buenas Prácticas de Manufactura (BPM) y procedimientos estandarizados de saneamiento. Desarrollo de habilidades para trabajar como miembro de un equipo interdisciplinario.",
  },
  {
    nombre: "PPS: Práctica en la Industria Alimentaria II",
    cre: 7,
    anio: 5,
    horas_interaccion: 96,
    horas_autonomo: 79,
    contenido_texto:
      "Se desarrolla en sectores productivos y/o proyectos concretos bajo supervisión docente. Análisis y control de las normativas sobre el etiquetado nutricional y su relación con la información que debe proporcionar la industria alimentaria. Participación en el desarrollo de nuevos productos, su caracterización y evaluación de su valor nutricional. Intervención en la mejora de procesos y productos alimentarios. Desarrollo de habilidades para trabajar como miembro de un equipo interdisciplinario.",
  },
  {
    nombre: "Política de salud alimentaria nacional y latinoamericana",
    cre: 5,
    anio: 5,
    horas_interaccion: 64,
    horas_autonomo: 61,
    contenido_texto:
      "Políticas públicas. Salud, alimentación, bienestar y desarrollo humano. Planes, programas y proyectos con componente alimentario y nutricional. La política alimentaria: conceptualización. Intersectorialidad. Sectores participantes: funciones y relaciones. Proceso de definición, planificación, ejecución y evaluación. Políticas alimentarias a nivel internacional, nacional, regional y local. La problemática alimentaria y las políticas alimentarias en la Argentina. Asistencia y complementación alimentaria. Asistencia alimentaria escolar. Sistemas basados en transferencias de ingresos. Asistencia alimentaria ante situaciones de emergencia.",
  },
  {
    nombre: "PPS: Práctica en Administración de Servicios de Alimentación",
    cre: 12,
    anio: 5,
    horas_interaccion: 140,
    horas_autonomo: 160,
    contenido_texto:
      "Participación en la etapa del proceso administrativo. Elaboración del plan de alimentación: normales y dietoterápicos según la institución. Intervención en los procesos de capacitación en el servicio y del RRHH. Evaluación de la calidad e inocuidad de los alimentos en todas las etapas. Organización de la compra de material necesario. Análisis y control de costos. Implementación de normas de saneamiento, higiene y bioseguridad alimentaria, edilicia, de equipamiento y personal. Comprender los distintos tipos de gestión de los servicios de alimentación. El rol del/la licenciado/a en nutrición en sistemas tercerizados.",
  },
  {
    nombre: "Trabajo final",
    cre: 7,
    anio: 5,
    horas_interaccion: 100,
    horas_autonomo: 75,
    contenido_texto:
      "Proyecto de Trabajo Final Integrador con asesoría tutorial metodológica y temática. Selección del área temática, metodología de búsqueda bibliográfica y antecedentes, relevancia y factibilidad del proyecto, elaboración de preguntas de investigación, planteamiento de hipótesis, objetivos generales y específicos, selección del universo y técnicas de muestreo, diseño metodológico, reparos éticos y conflictos de interés, operacionalización de variables, métodos de recolección de información, análisis estadístico, estrategias para presentar los resultados, contrastación de hipótesis, conclusiones e informe final y factibilidad de publicación.",
  },
  {
    nombre: "Nutrición en la actividad física y el deporte",
    cre: 4,
    anio: 5,
    horas_interaccion: 48,
    horas_autonomo: 52,
    contenido_texto:
      "Conceptos y definiciones de Actividad Física y Deporte: clasificación, características generales y especiales respecto del gasto energético y estado metabólico del deportista. Adaptaciones metabólicas agudas y crónicas producidas por el entrenamiento. Métodos de estimación del gasto energético y la ingesta alimentaria. Plan alimentario en la actividad física y el deporte. Evaluación nutricional en el deporte. Sistemas energéticos y su aplicación práctica. Fases de la práctica deportiva. Evaluación de la composición corporal. Cineantropometría. Suplementación y Ayudas Ergogénicas en el Deporte.",
  },
  {
    nombre: "Nutrigenómica y actualización de paradigmas en nutrición",
    cre: 3,
    anio: 5,
    horas_interaccion: 32,
    horas_autonomo: 43,
    contenido_texto:
      "Definiciones y áreas de estudio de la Nutrigenómica. Nutrigenética. Interacción entre el Genoma Humano y el Entorno. Principios de genética. Impacto de la dieta en la expresión génica. Fundamentos biológicos de la Epigenética. Regulación genética del consumo alimentario, gasto energético y adaptación ambiental. Personalización de la dieta basada en el genotipo. Aplicación de la nutrigenómica en el diagnóstico e intervención nutricional con énfasis en la prevención. Uso de la Nutrigenómica en obesidad, diabetes, enfermedades cardiovasculares y cáncer. Aspectos éticos y legales. Marco legal y regulatorio de la profesión en nutrición.",
  },
  {
    nombre: "PPS: Práctica en dietoterapia",
    cre: 12,
    anio: 5,
    horas_interaccion: 140,
    horas_autonomo: 160,
    contenido_texto:
      "Integración de actividades asistenciales programadas según necesidades y demanda de la población atendida. Participación activa en el diagnóstico de los problemas alimentarios-nutricionales. Elaboración de planes alimentarios normales y dietoterápicos. Diagnóstico, seguimiento y monitoreo del estado nutricional de las personas. Diagnóstico, seguimiento y monitoreo de tratamientos dietoterápicos. Desarrollo de habilidades para trabajar como miembro de un equipo interdisciplinario.",
  },
];
