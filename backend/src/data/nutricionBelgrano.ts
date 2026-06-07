// Plan de Estudios - Ajuste 2013
// Lic. en Nutrición — Universidad de Belgrano, Facultad de Ciencias de la Salud
//
// CRE calculado con: round(hs_semanales × 16 semanas × 1.5 / 25)
// horas_interaccion = hs_semanales × 16
// horas_autonomo    = hs_semanales × 8  (50 % del tiempo presencial)

export const BELGRANO_UNIVERSIDAD = "Universidad de Belgrano";
export const BELGRANO_CARRERA = "Licenciatura en Nutrición";
export const BELGRANO_TOTAL_CRE = 274; // 59+60+60+60+35

export const MATERIAS_NUTRICION_BELGRANO = [
  // ── 1.er AÑO · Semestre 1 ──────────────────────────────────────────────────
  {
    nombre: "Biología General",
    cre: 6,
    anio: 1,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Características generales de los seres vivos. Niveles de organización. Clasificación taxonómica. Bases fisicoquímicas de la vida. Estructuras macromoleculares simples y complejas. Organoides. Mecanismos de regulación metabólica. Regulación de la actividad genética. Biología celular. Histología. Tejidos adiposo, epitelial, conectivo, cartilaginoso y óseo, sanguíneo: metabolismo y funciones.",
  },
  {
    nombre: "Química General",
    cre: 8,
    anio: 1,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Estados de la materia. Teoría cinética de los gases. Gases reales. Sólidos. Fuerzas intermoleculares. Elementos de Termodinámica: 1.o y 2.o Principios. Sistemas de uno o dos componentes. Soluciones. Propiedades coligativas. Equilibrio químico. Equilibrio iónico. Óxido-reducción. Electroquímica. Pilas. Adsorción y coloides. Estructura atómica. Enlace químico. Periodicidad. Compuestos de inclusión y gases nobles. Química de los elementos representativos y de transición. Teoría de la unión en complejos.",
  },
  {
    nombre: "Técnica Culinaria",
    cre: 5,
    anio: 1,
    horas_interaccion: 80,
    horas_autonomo: 40,
    contenido_texto:
      "Terminología y procedimientos básicos de la gastronomía. Criterio cuali/cuantitativo en la preparación de los alimentos: pesos, medidas y utensilios de medición. Buenas Prácticas de Manufactura. Clasificación de alimentos. Grupos de alimentos y derivados. Técnicas de elaboración de alimentos. Métodos de cocción. Tipos de cocinas. Cocina regional. Recetas y menús. Patrimonio cultural, alimentario y gastronómico.",
  },
  {
    nombre: "Educación para la Salud",
    cre: 4,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Modelos y paradigmas educativos. Proceso de enseñanza y aprendizaje. Momentos y tipos de aprendizaje. Promoción de la Salud. El proceso salud-enfermedad. Modelos de creencias en salud. Educación para la salud y comunicación en salud. Principales estrategias y recursos educativos. Principios y etapas de la planificación en salud. Rol del profesional como agente educador en salud.",
  },
  {
    nombre: "Culturas Alimentarias",
    cre: 2,
    anio: 1,
    horas_interaccion: 32,
    horas_autonomo: 16,
    contenido_texto:
      "La salud-enfermedad como construcción social. Representaciones culturales. Antropología de la alimentación y su importancia en la situación alimentaria nutricional a nivel individual y poblacional. Complejidad del hecho alimentario. Etapas del consumo alimentario y factores socioculturales condicionantes. Introducción al conocimiento de los métodos cualitativos y cuantitativos utilizados en estudios alimentarios e investigaciones en salud.",
  },
  {
    nombre: "Práctica Profesional I",
    cre: 4,
    anio: 1,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Historia de la Carrera de Nutrición. Historia de la Alimentación. Historia de la Ciencia de la Nutrición. Hábitos Alimentarios. Conceptos y definiciones fundamentales en Nutrición. Educación Nutricional. Ley del Ejercicio Nutricional. Áreas de acción del Licenciado en Nutrición.",
  },

  // ── 1.er AÑO · Semestre 2 ──────────────────────────────────────────────────
  {
    nombre: "Anatomía Humana",
    cre: 8,
    anio: 1,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Introducción al estudio de los Sistemas Biológicos: la célula como unidad biológica. Tejidos. Sistema de la Locomoción: Osteología y artrología. Miología. Sistema Digestivo: formación y conducción del bolo alimenticio. Cavidad oral, glándulas salivales, faringe, esófago, estómago, duodeno, hígado y vías biliares, yeyuno, íleon. Sistema Respiratorio. Hematosis. Sistema Hemolinfoideo: glóbulos rojos, glóbulos blancos, plaquetas y factores de coagulación. Sistema Circulatorio: corazón, arterias, capilares, venas, linfáticos. Ciclo cardíaco. Sistemas de integración y coordinación. Sistema neuroendócrino: hipotálamo, hipófisis y sistema endócrino. Sistemas motores y somatosensoriales. Sentidos. Reproducción. Sistema Urinario.",
  },
  {
    nombre: "Bioquímica Nutricional",
    cre: 8,
    anio: 1,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Biomoléculas primordiales. Metabolismo. Membranas biológicas. Enzimas. Oxidaciones biológicas. Bioquímica Estructural. Estudio de las distintas biomoléculas: interrelaciones y características estructurales. Bases fisicoquímicas de las relaciones entre estructura y función biológica. Biosíntesis y metabolismo de los hidratos de carbono, aminoácidos y proteínas, hemoderivados, lípidos y ácidos nucleicos. Regulación metabólica. Digestión y absorción de biomoléculas. Biomembranas. Enzimas y Coenzimas. Aspectos bioquímicos de la actividad hormonal. Metabolismo de Vitaminas y Minerales. Información genética. Replicación y transcripción. Regulación e integración metabólica. Integración del metabolismo de hidratos de carbono, lípidos y aminoácidos en los diferentes tejidos.",
  },
  {
    nombre: "Química de los Alimentos",
    cre: 6,
    anio: 1,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Importancia. Agua: actividad, AW, distribución en los alimentos, congelamiento. Carbohidratos: clasificación y nomenclatura, reacciones de los monosacáridos, almidones. Proteínas: clasificación, estructura, desnaturalización, propiedades funcionales, modificaciones físicas, químicas y enzimáticas, aminoácidos, enzimas. Lípidos: clasificación, aspectos físicos y químicos, procesado de grasas y aceites. Vitaminas: hidrosolubles y liposolubles, contenido en alimentos, estabilidad. Minerales: propiedades, solubilidad. Pigmentos y Colorantes. Aditivos alimentarios.",
  },
  {
    nombre: "Nutrición Normal I",
    cre: 8,
    anio: 1,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Energía: Calorimetría. Componentes del gasto energético. Metabolismo Basal. Necesidades energéticas. Requerimientos y Recomendaciones Nutricionales. Leyes de Alimentación. Determinación del Valor Calórico Total. Principios nutritivos. Nociones de peso de los alimentos. Introducción a la Valoración Nutricional: peso corporal. Carbohidratos. Fibra Dietética. Proteínas. Balance de Nitrógeno. Calidad proteica. Digestibilidad. Aminoácidos. Lípidos. Plan de Alimentación: anamnesis alimentaria, fórmula sintética, caracteres del régimen, fórmula desarrollada, lista diaria de alimentos, selección de alimentos, distribución diaria, equivalencias. Vitaminas: concepto, clasificación, propiedades, fuentes, metabolismo, deficiencias. Minerales: clasificación, importancia nutricional.",
  },

  // ── 2.do AÑO · Semestre 1 ─────────────────────────────────────────────────
  {
    nombre: "Nutrición Normal II",
    cre: 8,
    anio: 2,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Vitaminas Liposolubles: A, D, E y K. Vitaminas Hidrosolubles: Tiamina, Riboflavina, B6, B12, Niacina, ácido fólico, ácido ascórbico, biotina, ácido pantoténico. Recomendaciones Nutricionales. Fósforo. Yodo. Zinc. Flúor. Cobre. Cromo. Selenio. Manganeso. Molibdeno. Cobalto. Calcio: fuentes, metabolismo, requerimientos. Hierro: fuentes, metabolismo, absorción, almacenamiento, requerimientos. Plan de Alimentación para Anemia. Plan de Alimentación del Anciano: cambios fisiológicos, requerimientos nutricionales, características de la alimentación. Plan de Alimentación para el Deportista. Plan de Alimentación para Embarazo y Lactancia. Plan de Alimentación para Menopausia. Bases Nutricionales del Plan Vegetariano: clasificación, complementación proteica, selección de alimentos.",
  },
  {
    nombre: "Fisiología Humana",
    cre: 8,
    anio: 2,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Fisiología General y Celular. Medio Interno. Fisiología del Aparato Digestivo. Fisiología del Aparato Cardiovascular. Fisiología del Aparato Respiratorio. Fisiología del Aparato Urinario. Neurofisiología y Locomoción. Fisiología endocrinológica. Aparato genital femenino y masculino. Fisiología de la nutrición y metabolismo.",
  },
  {
    nombre: "Técnica Dietética",
    cre: 8,
    anio: 2,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Introducción a la Gastronomía. Tipos de cocina. Cocinas internacionales. Servicios gastronómicos. Principios generales de la preparación de los alimentos. Características Organolépticas de los Alimentos. Evaluación sensorial. Técnicas del manejo de los Alimentos: bases físicas y químicas. Sistemas dispersos. Aplicación de calor. Carbohidrato, grasas, proteínas, azúcares, carnes, cereales, grasas y aceites, harinas, panificados, huevos, pastelería, leche, frutas, vegetales, salsas. Clasificación de alimentos y transformaciones posibles en alimentos de origen vegetal y animal. Emulsiones, bebidas e infusiones, helados.",
  },
  {
    nombre: "Economía General y Familiar",
    cre: 6,
    anio: 2,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Ideas, planes alimentarios, actividades de orientación al consumidor. Soluciones aplicables a la realidad socioeconómica de las familias y la sociedad en general. Necesidades nutricionales y costo. Factores ambientales, sociales, culturales y económicos. Oferta y disponibilidad de alimentos. Seguridad alimentaria. Precios de los alimentos. Teorías económicas sobre el comportamiento del consumidor. Análisis del sistema familiar, administración familiar, familia de escasos recursos, el consumidor y sus derechos. Trazado de regímenes normales económicos y alimentación del trabajador. Cálculo del cómputo proteico de la dieta a nivel familiar. Vitamina A y otras en la dieta económica.",
  },

  // ── 2.do AÑO · Semestre 2 ─────────────────────────────────────────────────
  {
    nombre: "Microbiología de los Alimentos",
    cre: 4,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Descomposición de los alimentos por microorganismos. Curvas de Crecimiento. Factores que regulan el crecimiento de los microorganismos en alimentos: condiciones ambientales, propiedades físicas y químicas, disponibilidad de oxígeno, temperatura. Microorganismos más importantes en la Tecnología de los Alimentos: hongos, levaduras, bacterias. Enfermedades causadas por microorganismos en alimentos. Enzimas en la tecnología alimentaria. Conservación de alimentos por fermentación.",
  },
  {
    nombre: "Probabilidad y Estadística",
    cre: 4,
    anio: 2,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Fundamentos del cálculo de probabilidades. Estadística descriptiva, histogramas. Variables aleatorias. Muestras aleatorias. Distribuciones de probabilidades. Distribución de muestreo. Inferencia estadística. Estimación puntual. Intervalos de confianza. Prueba de hipótesis. Modelo lineal. Regresión y correlación. Análisis de residuos. Estimación robusta. Análisis de varianza.",
  },
  {
    nombre: "Salud Pública y Administración de Salud",
    cre: 6,
    anio: 2,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Salud y Enfermedad. Aspectos psicosociales de la enfermedad y los enfermos. Creencias sobre la salud. Modelos de salud y comportamiento. Higiene y Sanidad. El ambiente sanitario. Saneamiento ambiental en el contexto de Salud Pública. Calidad y costo de la atención de la salud. El equipo de salud y las profesiones. El nutricionista frente a los problemas de Salud Pública. Políticas de Salud y el Alimento: contaminación del suelo, desechos industriales, residuos peligrosos. El Sistema de Salud en la Argentina: subsistemas, formas de financiación, instituciones. Atención primaria de la salud.",
  },
  {
    nombre: "Fisiología y Nutrición del Niño Sano",
    cre: 12,
    anio: 2,
    horas_interaccion: 192,
    horas_autonomo: 96,
    contenido_texto:
      "Crecimiento y Desarrollo Prenatal. Crecimiento en las diferentes Etapas de la Vida. Gráficas de Crecimiento. Recién Nacido. Recién nacido Pretérmino. Valoración Nutricional. Requerimientos y Recomendaciones Nutricionales. Anatomía y Fisiología de la Mama. Leche Materna. Alimentación Específica y No Específica del recién nacido y el lactante. Desarrollo del Tubo Digestivo. Desarrollo Neurológico. Alimentación Complementaria. Equilibrio Hidro-Salino. Metabolismo del Agua y Electrolitos. Metabolismo del Hierro, Calcio y Vitaminas Liposolubles. Alimentación en primera infancia, segunda infancia y adolescencia.",
  },
  {
    nombre: "Práctica Profesional II",
    cre: 2,
    anio: 2,
    horas_interaccion: 32,
    horas_autonomo: 16,
    contenido_texto:
      "Historia de la creación de la carrera de Licenciatura en Nutrición en la Argentina. Pedro Escudero: reseña bibliográfica. Anamnesis Alimentaria: individual, poblacional. Hábitos Alimentarios. Guías Alimentarias para la población argentina: análisis y aplicación en Educación Alimentaria Nutricional. Antropometría: definición, medidas. Método ENFA. Funciones del Licenciado en Nutrición en el ámbito asistencial. La consulta al Nutricionista: relación profesional/paciente. Visitas de ámbito asistencial.",
  },

  // ── 3.er AÑO · Semestre 1 ─────────────────────────────────────────────────
  {
    nombre: "Bromatología y Tecnología Alimentaria",
    cre: 8,
    anio: 3,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Nutrientes del organismo y componentes de los alimentos: agua, hidratos de carbono, lípidos, minerales y vitaminas, componentes que imparten color, textura, gusto y olor. Aditivos alimentarios. Composición y propiedades nutritivas. Alteraciones físicas, químicas y biológicas de materias primas y productos alimenticios. Preservación de alimentos. Envases. Alimentos grasos de origen animal y vegetal. Alimentos cárneos. Huevos. Alimentos lácteos. Alimentos ricos en azúcares. Cereales y derivados. Frutas y legumbres. Bebidas hídricas y analcohólicas. Agua potable. Bebidas alcohólicas. Productos estimulantes: café, té, yerba mate, cacao y chocolate. Productos deshidratados, congelados y conservas. Métodos analíticos de control de calidad. Legislación Alimentaria.",
  },
  {
    nombre: "Psicosociología de la Nutrición",
    cre: 6,
    anio: 3,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Aporte de la psicología al análisis de los problemas nutricionales. Papel de la alimentación en el proceso continuo de adaptación del hombre a su ambiente. La nutrición como Ciencia Social. Aportes a la problemática de la Salud. Nutrición en la Historia. El hombre en su realidad ecológica y social: socialización, marginalidad, alimentación y patrones de comportamiento, necesidades humanas. Cambios en patrones alimentarios. La familia como unidad básica: psicodinamismos, ciclo vital, salud mental y familiar. Maternidad e infancia. Desarrollo humano: ciclo vital, desarrollo prenatal y nutrición. Estadios de la infancia: desnutrición y deprivación social. Adolescencia: imagen corporal, alteraciones oroalimentarias, bulimia, anorexia, obesidad, alcoholismo. Juventud y adultez media: relaciones sociales, estilo de vida, salud y enfermedad.",
  },
  {
    nombre: "Microbiología y Parasitología",
    cre: 6,
    anio: 3,
    horas_interaccion: 96,
    horas_autonomo: 48,
    contenido_texto:
      "Sistemática microbiológica. Estudio microscópico y macroscópico de bacterias y hongos. Los microorganismos como células. Genética bacteriana. Estudio de la actividad bioquímica de las bacterias. Nutrición de los microorganismos e influencias ambientales sobre el desarrollo microbiano. Procesos industriales con microorganismos. Introducción a la Virología. Mecanismos de patogenicidad microbiana. Mecanismos de resistencia. Estructura y comportamiento biológico de las diferentes especies que parasitan al hombre, con especial énfasis en las que ocurren en Latinoamérica. Análisis de los mecanismos de agresión y defensa. Clasificación de los parásitos. Características de protozoos, nematodes, plathyelmintes. Ciclo evolutivo. Diagnóstico parasitológico. Profilaxis.",
  },
  {
    nombre: "Comercialización y Distribución de Alimentos",
    cre: 4,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Relaciones existentes entre el desarrollo económico de una región, la disponibilidad alimentaria y los medios de producción. Tecnologías de producción, envasado, transporte, conservación, promoción comercial, distribución y comercialización minorista y mayorista: impacto sobre el estado nutricional de la población e influencias como factores de cambio cultural. Factores que condicionan la actividad económica. Suelo, factores, producción y comercialización nacional y exterior. Agricultura y ganadería, hortalizas y frutas, leche y derivados, pesca, aves y huevos.",
  },
  {
    nombre: "Habilitación Profesional I",
    cre: 4,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Alcances del título de Licenciado en Nutrición: funciones del nutricionista. Áreas de desempeño. Trabajos de Investigación y el Licenciado en Nutrición. Rol del nutricionista ante situaciones especiales. Equipo interdisciplinario, derivación de casos. Pirámides Nutricionales: de uso nacional e internacional, análisis, comparaciones, ventajas y desventajas. Organismos Internacionales en Nutrición y Alimentación. Dietas de Moda: análisis, beneficios, riesgos. Influencia de los medios de comunicación: dietas y población. Mitos.",
  },

  // ── 3.er AÑO · Semestre 2 ─────────────────────────────────────────────────
  {
    nombre: "Política y Legislación Alimentaria",
    cre: 4,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Políticas socioeconómicas en el área de la Alimentación. Relación de políticas alimentarias con salud, educación, acción y comunicación social. Relación con el desarrollo nacional: índices y criterios de subdesarrollo. Desarrollo de políticas alimentarias en el área económica, tecnológica y de legislación industrial. Consumo de alimentos. Canasta Básica. Estadísticas Nutricionales. Deficiencias nutricionales en la Argentina. Legislación Sanitaria e Industrial. Código Alimentario Argentino. Normas Nacionales e Internacionales. Estandarización del Rotulado Nutricional. Políticas de protección al consumidor. Proceso de integración del MERCOSUR.",
  },
  {
    nombre: "Educación Alimentaria",
    cre: 8,
    anio: 3,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "El nutricionista como agente educador en el área de la nutrición y alimentación. Educación Alimentaria Nutricional (EAN). Educación formal y no formal. Nivel individual y poblacional. Componentes técnicos y pedagógicos. Detección de problemas alimentarios y nutricionales. Identificación de recursos naturales. Herramientas para la EAN. El planeamiento educativo en nutrición y su implementación. Desarrollo de Guías de Alimentación. Talleres: concepto, organización e implementación. EAN aplicada a Escuelas, Comunidades, embarazadas, ancianos y terapéuticas. EAN aplicada a Comedores Comunitarios. EAN en comunidades rurales.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia Infantil",
    cre: 12,
    anio: 3,
    horas_interaccion: 192,
    horas_autonomo: 96,
    contenido_texto:
      "Valoración Nutricional del Niño Enfermo. Deshidratación. Desnutrición. Raquitismo. Escorbuto. Diarreas agudas. Tratamiento Nutricional. Anemias Nutricionales. Síndrome diarreico. Diarreas Crónicas: Enfermedad Celíaca, Enfermedad Fibroquística del Páncreas. Obesidad. Diabetes. Reflujo Gastroesofágico. Patologías Hepáticas: Hepatitis A y B, Hepatopatías Crónicas. Patologías Cardíacas congénitas. Neuropatías Pediátricas. Síndrome Urémico Hemolítico. Fenilcetonuria. Tratamiento Nutricional y Plan de Alimentación en las diferentes situaciones fisiopatológicas.",
  },
  {
    nombre: "Evaluación Nutricional",
    cre: 4,
    anio: 3,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Evaluación individual en el contexto clínico. Evaluación poblacional y su utilización en salud pública. Componentes de la evaluación nutricional: composición corporal. Tipos de indicadores: propósito, utilidad y limitaciones. Métodos de evaluación dietética. Evaluación de factores de riesgo. Selección de indicadores según hipótesis del proyecto. Medidas, índices e indicadores. Técnicas para efectuar las mediciones. Evaluación antropométrica en grupos fisiológicos especiales: niños, adolescentes y embarazadas. Cálculo de la ingesta alimentaria. Métodos de registro de alimentos. Cuestionarios de frecuencia cualitativos y semicuantitativos. Evaluación bioquímica: marcadores del estado nutricional. Evaluación clínica. Estudios económicos, disponibilidad de alimentos, gastos e ingresos de los hogares. Evaluación de intervenciones nutricionales en la población.",
  },

  // ── 4.to AÑO · Semestre 1 ─────────────────────────────────────────────────
  {
    nombre: "Administración de Servicios Alimentarios",
    cre: 8,
    anio: 4,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Dirección y administración de servicios de alimentación de colectividades sanas. Asistencia alimentaria en geriátricos, escolar y hospitalaria. Servicio de alimentación: objetivos, funciones, planta física, equipamiento, administración de personal, servicios centralizados y descentralizados, saneamiento y seguridad. Conceptos básicos de organización y administración de un Servicio de Alimentación. Planificación de listas de comida, determinación de necesidades, políticas de adquisición de alimentos, control de costos. Lactarios o cocina de leche: objetivos, funciones, distribución y servicio de biberones, control de calidad. Asistencia alimentaria en emergencia: organización y determinación de grupos biológicos.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia del Adulto I",
    cre: 8,
    anio: 4,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "Fisiología del Ayuno. Desnutrición. Obesidad: regulación del apetito, diagnóstico. Cardiopatías: Hipertensión Arterial, Insuficiencia Cardíaca Congestiva, Infarto Agudo de Miocardio, Dislipemias. Enfermedades Metabólicas: Diabetes tipo 1 y tipo 2, Hipoglucemia, complicaciones de la diabetes. Patologías Renales: Insuficiencia Renal Aguda y Crónica, Síndrome Nefrótico, Nefrolitiasis, tratamiento conservador y diálisis. Patologías Respiratorias: Neumonía, EPOC, Insuficiencia Respiratoria. Proceso del cuidado nutricional. Valoración del Estado Nutricional. Determinación de Requerimientos Nutricionales. Manejo Nutricional de las diferentes situaciones fisiopatológicas. Plan de Alimentación para desnutrición, obesidad, cardiopatías, DBT tipo 1 y 2, renal, respiratorio.",
  },
  {
    nombre: "Metodología de la Investigación",
    cre: 4,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Concepto de ciencia. Ciencias fácticas y formales. Métodos deductivos y probabilísticos. Fases de una investigación: delimitación del marco teórico, elaboración de hipótesis de trabajo, diseño de la investigación, elección del tipo de prueba, recolección de datos. Análisis de los resultados. Elementos básicos para la elaboración de un informe de investigación.",
  },
  {
    nombre: "Toxicología de los Alimentos",
    cre: 4,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Higiene de los alimentos. Actividad farmacológica de agentes químicos. Mecanismos de la acción tóxica. Agentes tóxicos naturalmente presentes en alimentos. Componentes de leguminosas. Toxinas en Cereales. Bebidas estimulantes. Aminoácidos, péptidos y proteínas tóxicas. Gosipol. Capsacina. Solanina. Sustancias bociogénicas. Toxinas en mariscos y peces. Antivitaminas. Toxicidad de aditivos alimentarios: conservantes, colorantes, potenciadores, antioxidantes, saborizantes y aromatizantes. Edulcorantes, nitratos y nitritos. Toxicidad de contaminantes: plaguicidas, metales tóxicos. Agentes tóxicos generados durante el procesamiento de alimentos. Irradiación de alimentos. Abastecimiento de agua potable. Aguas residuales. Contaminación atmosférica.",
  },

  // ── 4.to AÑO · Semestre 2 ─────────────────────────────────────────────────
  {
    nombre: "Técnica Dietoterápica",
    cre: 8,
    anio: 4,
    horas_interaccion: 128,
    horas_autonomo: 64,
    contenido_texto:
      "La técnica dietoterápica. Inocuidad. Utilización de la energía. Nutraterapéuticos. Sistemas controlados en Sodio, Potasio y Fósforo. Sistemas controlados en Purinas. Sistemas controlados en Lípidos. Sistemas controlados en Carbohidratos. Sistemas controlados en Proteínas. Adecuación de la consistencia de los alimentos. Técnicas para facilitar la evacuación y el trabajo gástrico. Técnicas para facilitar la acción de las enzimas digestivas. Técnicas para favorecer la absorción de nutrientes. Técnicas que favorezcan la evacuación intestinal.",
  },
  {
    nombre: "Farmacología y Nutrición",
    cre: 4,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Farmacocinética. Farmacodinamia. Generalidades interacción fármaco/nutriente. Ensayos clínicos. Hormonas tiroideas. Antiinflamatorios no esteroides. Drogas utilizadas en las Dislipemias. Drogas utilizadas en Obesidad. Drogas que modifican el peso. Drogas utilizadas en bulimia y anorexia nerviosa.",
  },
  {
    nombre: "Fisiopatología y Dietoterapia del Adulto II",
    cre: 12,
    anio: 4,
    horas_interaccion: 192,
    horas_autonomo: 96,
    contenido_texto:
      "Patologías del Aparato Digestivo. Esofágicas: Reflujo Gastroesofágico, Hernia Hiatal. Gástricas: Úlcera Péptica. Intestinales: Diarrea, Enfermedad Celíaca, Enfermedad Inflamatoria Intestinal, Enfermedad Diverticular, Síndrome de Intestino Irritable. Hepáticas: Hepatopatías Compensadas y Descompensadas. Biliares: Colelitiasis, Colecistitis. Pancreáticas: Pancreatitis Aguda y Crónica, Cáncer de Páncreas. Cirugías Digestivas: Gastrectomías, Resecciones Intestinales, Síndrome de Intestino Corto, Fístulas Intestinales. Valoración Nutricional y Determinación de Requerimientos Nutricionales. Manejo nutricional de cada patología. Apoyo Nutricional: Alimentación Enteral y Parenteral.",
  },
  {
    nombre: "Habilitación Profesional II",
    cre: 4,
    anio: 4,
    horas_interaccion: 64,
    horas_autonomo: 32,
    contenido_texto:
      "Resolución de problemas habituales encontrados en la práctica profesional en los servicios de alimentación públicos y privados. Problemas de administración de servicios. Planteamiento y ejecución de Proyectos de consultoría y asesoría.",
  },
  {
    nombre: "Trabajo Final de Carrera",
    cre: 2,
    anio: 4,
    horas_interaccion: 32,
    horas_autonomo: 16,
    contenido_texto:
      "La comunicación científica y técnica. Tipos diferentes de presentación. El artículo científico. Tesis y tesinas. Selección de tema, tutor y lugar de trabajo. El Trabajo Final de Carrera como investigación. La importancia del trabajo experimental y de recolección de datos. Diseño en función de la naturaleza del problema: plan de trabajo. Análisis de los resultados. Redacción del trabajo, organización de los contenidos. Presentación oral o defensa.",
  },

  // ── 5.to AÑO · Semestre 1 (residencia + tesis) ────────────────────────────
  {
    nombre: "Trabajo Social Profesional",
    cre: 16,
    anio: 5,
    horas_interaccion: 400,
    horas_autonomo: 0,
    contenido_texto:
      "Residencia profesional de 400 horas en instituciones de salud, comedores comunitarios, servicios de alimentación u organismos públicos o privados vinculados a la nutrición. Integración de los conocimientos teórico-prácticos adquiridos durante la carrera. Trabajo interdisciplinario. Elaboración de informe final de práctica.",
  },
  {
    nombre: "Desarrollo del Trabajo Final de Carrera",
    cre: 19,
    anio: 5,
    horas_interaccion: 320,
    horas_autonomo: 160,
    contenido_texto:
      "Desarrollo, redacción y defensa del Trabajo Final de Carrera bajo la supervisión del tutor. Revisión bibliográfica, recolección y análisis de datos. Aplicación de la metodología de investigación seleccionada. Redacción del informe final. Presentación oral ante tribunal evaluador.",
  },
];
