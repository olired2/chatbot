import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import fs from 'fs/promises';

const DOCS_PATH = path.join(process.cwd(), 'uploads');
const CHROMA_PATH = path.join(process.cwd(), 'chroma_db');

if (!process.env.GOOGLE_API_KEY) {
  console.warn('⚠️ GOOGLE_API_KEY no encontrada. El agente virtual no funcionará.');
}

const genAI = process.env.GOOGLE_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  : null;

// HuggingFace deshabilitado por problemas de configuración
const hf = null;

// Función para analizar el contenido temático de los documentos
function analyzeClassContent(documents: ProcessedDocument[]): {
  themes: string[];
  keywords: string[];
  focus: string;
  confidence: number;
} {
  const allText = documents.map(doc => doc.content).join(' ').toLowerCase();
  
  // Análisis temático mejorado con scoring ponderado - Incluye áreas académicas
  const themeAnalysis = {
    'Plan de Negocio': {
      high: ['plan de negocio', 'business plan', 'modelo de negocio', 'business model canvas'],
      medium: ['canvas', 'estrategia empresarial', 'propuesta de valor', 'segmento cliente'],
      low: ['mercado objetivo', 'competencia', 'ventaja competitiva']
    },
    'Marketing': {
      high: ['marketing', 'publicidad', 'branding', 'estrategia marketing'],
      medium: ['marca', 'segmentación', 'posicionamiento', 'target', 'audiencia'],
      low: ['promoción', 'comunicación', 'redes sociales', 'campaña']
    },
    'Finanzas': {
      high: ['finanzas', 'análisis financiero', 'inversión', 'presupuesto'],
      medium: ['roi', 'flujo de caja', 'rentabilidad', 'capital', 'financiamiento'],
      low: ['costos', 'ingresos', 'gastos', 'precio', 'valor']
    },
    'Innovación': {
      high: ['innovación', 'design thinking', 'creatividad', 'disrupción'],
      medium: ['prototipo', 'mvp', 'producto mínimo viable', 'transformación'],
      low: ['tecnología', 'digital', 'cambio', 'desarrollo']
    },
    'Liderazgo': {
      high: ['liderazgo', 'gestión equipos', 'dirección', 'management'],
      medium: ['equipo', 'recursos humanos', 'motivación', 'coordinación'],
      low: ['comunicación', 'delegación', 'toma decisiones']
    },
    'Emprendimiento': {
      high: ['emprendimiento', 'startup', 'emprendedor', 'entrepreneur'],
      medium: ['empresa', 'negocio', 'oportunidad', 'riesgo empresarial'],
      low: ['iniciativa', 'proyecto', 'idea negocio']
    },
    'Cultura Empresarial': {
      high: ['cultura empresarial', 'valores organizacionales', 'clima laboral'],
      medium: ['cultura', 'valores', 'misión', 'visión', 'objetivos'],
      low: ['ética', 'responsabilidad', 'compromiso']
    },
    'Metodologías': {
      high: ['scamper', 'design thinking', 'lean startup', 'metodología'],
      medium: ['foda', 'swot', 'agile', 'canvas', 'framework'],
      low: ['herramientas', 'técnicas', 'proceso', 'método']
    },
    'Química': {
      high: ['química', 'reacción química', 'elemento químico', 'compuesto químico'],
      medium: ['átomo', 'molécula', 'ion', 'enlace', 'valencia', 'ph'],
      low: ['laboratorio', 'experimento', 'fórmula', 'tabla periódica']
    },
    'Ciencias': {
      high: ['biología', 'física', 'matemáticas', 'ciencias naturales'],
      medium: ['investigación', 'experimento', 'hipótesis', 'teoría'],
      low: ['análisis', 'observación', 'método científico', 'datos']
    },
    'Tecnología': {
      high: ['programación', 'software', 'desarrollo', 'código'],
      medium: ['algoritmo', 'base de datos', 'aplicación', 'sistema'],
      low: ['tecnología', 'digital', 'informática', 'computación']
    },
    'Educación': {
      high: ['pedagogía', 'didáctica', 'enseñanza', 'aprendizaje'],
      medium: ['estudiante', 'alumno', 'profesor', 'clase', 'curso'],
      low: ['educación', 'formación', 'conocimiento', 'capacitación']
    }
  };
  
  const detectedThemes: string[] = [];
  const keywords: string[] = [];
  const themeScores: { [key: string]: number } = {};
  
  // Calcular puntuación por tema
  Object.entries(themeAnalysis).forEach(([theme, patterns]) => {
    let score = 0;
    
    // Palabras alta relevancia (peso 3)
    patterns.high.forEach(keyword => {
      if (allText.includes(keyword)) {
        score += 3;
        keywords.push(keyword);
      }
    });
    
    // Palabras relevancia media (peso 2)
    patterns.medium.forEach(keyword => {
      if (allText.includes(keyword)) {
        score += 2;
        keywords.push(keyword);
      }
    });
    
    // Palabras baja relevancia (peso 1)
    patterns.low.forEach(keyword => {
      if (allText.includes(keyword)) {
        score += 1;
        keywords.push(keyword);
      }
    });
    
    if (score > 0) {
      themeScores[theme] = score;
    }
  });
  
  // Ordenar temas por puntuación
  const sortedThemes = Object.entries(themeScores)
    .sort(([,a], [,b]) => b - a)
    .map(([theme]) => theme);
  
  detectedThemes.push(...sortedThemes);
  
  // Calcular nivel de confianza
  let confidence = 0.5;
  if (sortedThemes.length >= 2) {
    const scores = Object.values(themeScores).sort((a, b) => b - a);
    const difference = scores[0] - scores[1];
    confidence = Math.min(0.95, 0.3 + (difference / scores[0]) * 0.6);
  } else if (sortedThemes.length === 1) {
    confidence = 0.8;
  }
  
  // Determinar enfoque principal
  let focus = 'cultura empresarial y emprendimiento general';
  if (detectedThemes.length > 0) {
    focus = detectedThemes.slice(0, 3).join(', ');
  }
  
  return { themes: detectedThemes, keywords: [...new Set(keywords)], focus, confidence };
}

// Función para generar una persona adaptativa basada en el contenido de la clase
function generateAdaptiveMentorPersona(documents: ProcessedDocument[], className?: string): string {
  const contentAnalysis = analyzeClassContent(documents);
  const primaryTheme = contentAnalysis.themes[0] || 'Cultura Empresarial';
  const confidence = contentAnalysis.confidence;
  
  // Sistema de especialización dinámica basado en el tema principal
  const specializationProfiles = {
    'Plan de Negocio': {
      specialization: 'desarrollo de planes de negocio, análisis estratégico y modelado empresarial',
      methodologies: 'Business Model Canvas, Análisis FODA, Lean Canvas, Value Proposition Canvas, Customer Development',
      examples: 'Airbnb, Uber, Netflix, Amazon, Spotify',
      focus: 'estructuración de ideas, validación de hipótesis, análisis de mercado y creación de propuestas de valor sólidas',
      tone: 'estratégico y analítico'
    },
    'Marketing': {
      specialization: 'marketing digital, branding estratégico y comunicación de marca',
      methodologies: 'Marketing Mix (4P/7P), Segmentación RFM, Customer Journey Mapping, Growth Hacking, Content Marketing',
      examples: 'Nike, Coca-Cola, Apple, Starbucks, Red Bull',
      focus: 'construcción de marca, segmentación de audiencias, posicionamiento y estrategias de comunicación efectiva',
      tone: 'creativo y orientado al impacto'
    },
    'Finanzas': {
      specialization: 'análisis financiero, gestión de inversiones y planificación económica empresarial',
      methodologies: 'Análisis ROI/VPN/TIR, Flujo de Caja Descontado, Análisis de Ratios, Balanced Scorecard, Budget Planning',
      examples: 'Warren Buffett (Berkshire), JP Morgan, Goldman Sachs, Blackstone',
      focus: 'evaluación de viabilidad, análisis de riesgo-retorno, optimización de recursos y toma de decisiones financieras',
      tone: 'preciso y orientado a datos'
    },
    'Innovación': {
      specialization: 'innovación disruptiva, design thinking y transformación digital',
      methodologies: 'Design Thinking, SCAMPER, Blue Ocean Strategy, Jobs-to-be-Done, Rapid Prototyping, MVP Development',
      examples: 'Apple, Google, Tesla, SpaceX, 3M, IDEO',
      focus: 'generación de ideas creativas, prototipado rápido, pensamiento disruptivo y cultura de experimentación',
      tone: 'visionario y experimental'
    },
    'Liderazgo': {
      specialization: 'liderazgo transformacional, gestión de equipos de alto rendimiento y desarrollo organizacional',
      methodologies: 'Liderazgo Situacional (Hersey-Blanchard), Teoría U, Team Canvas, OKRs, Feedback 360°',
      examples: 'Jack Ma (Alibaba), Satya Nadella (Microsoft), Indra Nooyi (PepsiCo), Jeff Bezos (Amazon)',
      focus: 'desarrollo de competencias directivas, motivación de equipos, comunicación efectiva y gestión del cambio',
      tone: 'inspirador y empático'
    },
    'Emprendimiento': {
      specialization: 'emprendimiento de alto impacto, ecosistemas startup y mentalidad empresarial',
      methodologies: 'Lean Startup, Customer Development, Pitch Deck Structure, Business Angels/VC, Pivot Strategies',
      examples: 'Elon Musk, Sara Blakely (Spanx), Brian Chesky (Airbnb), Reid Hoffman (LinkedIn)',
      focus: 'identificación de oportunidades, validación de mercado, escalabilidad y mentalidad de crecimiento',
      tone: 'dinámico y orientado a oportunidades'
    },
    'Cultura Empresarial': {
      specialization: 'cultura organizacional, valores empresariales y desarrollo de talento humano',
      methodologies: 'Organizational Culture Inventory, Values Assessment, Cultural Transformation, Employee Engagement',
      examples: 'Google, Zappos, Patagonia, Southwest Airlines, Ben & Jerry\'s',
      focus: 'construcción de culturas sólidas, alineación de valores, compromiso organizacional y desarrollo humano',
      tone: 'humanístico y transformacional'
    },
    'Metodologías': {
      specialization: 'metodologías empresariales, frameworks de innovación y herramientas de gestión',
      methodologies: 'Agile/Scrum, Six Sigma, Kaizen, OKRs, BSC, Project Management (PMI)',
      examples: 'Toyota (Lean), GE (Six Sigma), Spotify (Agile), Intel (OKRs)',
      focus: 'optimización de procesos, implementación de frameworks, mejora continua y eficiencia operacional',
      tone: 'metodológico y orientado a resultados'
    },
    'Química': {
      specialization: 'química general, orgánica e inorgánica con enfoque en aplicaciones prácticas',
      methodologies: 'Método Científico, Análisis Cualitativo/Cuantitativo, Espectroscopia, Cromatografía, Síntesis Orgánica',
      examples: 'Marie Curie, Linus Pauling, Dorothy Hodgkin, Ahmed Zewail',
      focus: 'comprensión de estructuras moleculares, mecanismos de reacción, análisis de laboratorio y aplicaciones industriales',
      tone: 'científico y riguroso'
    },
    'Ciencias': {
      specialization: 'ciencias naturales con enfoque interdisciplinario y metodología científica',
      methodologies: 'Método Científico, Análisis Estadístico, Modelado Matemático, Experimentación Controlada',
      examples: 'Einstein, Darwin, Newton, Watson & Crick',
      focus: 'desarrollo del pensamiento científico, análisis crítico, investigación y comprensión de fenómenos naturales',
      tone: 'analítico y basado en evidencias'
    },
    'Tecnología': {
      specialization: 'desarrollo tecnológico, programación y sistemas computacionales',
      methodologies: 'Metodologías Ágiles, DevOps, Clean Code, TDD, Design Patterns, Arquitecturas de Software',
      examples: 'Linus Torvalds, Tim Berners-Lee, Ada Lovelace, Alan Turing',
      focus: 'resolución de problemas mediante tecnología, desarrollo de software, automatización y innovación digital',
      tone: 'lógico y orientado a soluciones'
    },
    'Educación': {
      specialization: 'pedagogía moderna, didáctica y metodologías de enseñanza-aprendizaje',
      methodologies: 'Bloom\'s Taxonomy, Constructivismo, Aprendizaje Activo, Flipped Classroom, Gamificación',
      examples: 'John Dewey, Maria Montessori, Jean Piaget, Paulo Freire',
      focus: 'facilitación del aprendizaje, desarrollo de competencias, evaluación formativa y educación inclusiva',
      tone: 'pedagógico y centrado en el estudiante'
    }
  };
  
  // Seleccionar perfil de especialización
  const profile = specializationProfiles[primaryTheme as keyof typeof specializationProfiles] || specializationProfiles['Cultura Empresarial'];
  
  // Adaptar intensidad según confianza en la detección
  const adaptationLevel = confidence > 0.8 ? 'ALTAMENTE ESPECIALIZADO' : 
                          confidence > 0.6 ? 'ESPECIALIZADO' : 'GENERALISTA ADAPTATIVO';
  
  const classContext = className ? `Esta clase se enfoca en: "${className}".` : '';
  const themeContext = contentAnalysis.themes.length > 0 
    ? `Especialización detectada: ${contentAnalysis.themes.slice(0, 3).join(', ')} (confianza: ${Math.round(confidence * 100)}%).`
    : '';
  const keywordContext = contentAnalysis.keywords.length > 0
    ? `Conceptos clave: ${contentAnalysis.keywords.slice(0, 10).join(', ')}.`
    : '';
  
  return `
IDENTIDAD PROFESIONAL ESPECIALIZADA:
Eres un experto especialista en ${profile.specialization} con años de experiencia práctica y académica.

PRESENTACIÓN PROFESIONAL:
Siempre te presentas como un especialista en el área detectada. Cuando respondas, inicia con una introducción como:
- "Como especialista en ${primaryTheme.toLowerCase()}..."
- "Desde mi experiencia en ${profile.specialization}..."
- "En el área de ${primaryTheme.toLowerCase()}, mi recomendación es..."

${classContext}
${themeContext}
${keywordContext}

PERFIL DE ESPECIALIZACIÓN:
Tu enfoque se centra en ${profile.focus}, manteniendo un estilo ${profile.tone}.

📋 METODOLOGÍAS DOMINADAS:
${profile.methodologies}

🏆 REFERENCIAS Y EJEMPLOS:
Utilizas casos de éxito como: ${profile.examples}

🎨 ESTILO DE COMUNICACIÓN ADAPTATIVO:
• **Estructura clara**: Organizas información en secciones lógicas y fáciles de seguir
• **Ejemplos contextuales**: Seleccionas casos específicos relevantes al tema de la clase
• **Formato visual**: Usas listas, viñetas y **negritas** para destacar conceptos clave
• **Profundidad variable**: Respuestas breves para conceptos simples, detalladas para metodologías complejas
• **Lenguaje apropiado**: Ajustas el nivel técnico según el contexto y audiencia

🔧 PRINCIPIOS DE ADAPTACIÓN DINÁMICA:
1. **CONTEXTUALIZACIÓN PRIMARIA**: Siempre prioriza el contenido específico de los documentos de clase
2. **ESPECIALIZACIÓN TEMÁTICA**: Adapta ejemplos, metodologías y enfoques al tema detectado
3. **CONEXIÓN PRÁCTICA**: Vincula conceptos teóricos con aplicaciones del mundo real
4. **PERSONALIZACIÓN PROGRESIVA**: Ajusta el nivel de detalle según la complejidad de la pregunta
5. **REFERENCIAS RELEVANTES**: Utiliza ejemplos de empresas/líderes apropiados para el contexto

🎯 ENFOQUE DE RESPUESTA:
- Para conceptos básicos: Explicaciones claras con 1-2 ejemplos prácticos
- Para metodologías: Pasos estructurados, herramientas específicas y casos de aplicación
- Para análisis complejos: Frameworks detallados, múltiples perspectivas y recomendaciones accionables

COMPORTAMIENTO COMO ESPECIALISTA AMIGABLE:
1. Te presentas como experto pero de manera cercana y accesible
2. Usas terminología técnica pero la explicas de forma simple
3. Compartes experiencias de manera conversacional: "Te cuento que he visto..."
4. Eres entusiasta sobre tu área: "¡Me encanta este tema porque..."
5. Das consejos como un mentor cercano: "Mira, lo que yo haría..."

FORMATO DE RESPUESTA CONVERSACIONAL:
- Inicia de manera amigable: "¡Hola! Como especialista en [área], me emociona poder ayudarte con esto..."
- Desarrolla con cercanía: "Te explico de manera sencilla..." / "Déjame contarte..."
- Usa ejemplos familiares: "Es como cuando..." / "Imagínate que..."
- Concluye motivando: "¡Espero que te sirva!" / "¿Te quedó claro? ¡Pregúntame si tienes dudas!"

TU MISIÓN COMO ESPECIALISTA AMIGABLE:
Ser el mentor especializado más querido y efectivo, combinando:
• Tu conocimiento profundo en ${primaryTheme} explicado de manera simple
• El contenido de los documentos presentado de forma interesante
• Ejemplos divertidos y fáciles de recordar
• Anécdotas y casos "de la vida real" contados con entusiasmo
• Consejos prácticos dados con cariño y motivación

Cada respuesta debe hacer sentir al estudiante que tiene un mentor experto, amigable y entusiasta que realmente quiere ayudarlo a aprender ${primaryTheme.toLowerCase()}.
`;
}

// Interfaz para almacenar documentos procesados
interface ProcessedDocument {
  content: string;
  metadata: {
    source: string;
    page?: number;
  };
  embedding?: number[]; // Para almacenar embeddings
}

// Función para calcular similitud coseno
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Función para generar embeddings mejorada (sin API externa)
async function generateEmbedding(text: string): Promise<number[] | null> {
  console.log('⚠️ Usando embedding semántico mejorado sin API externa');
  
  const cleanText = text.toLowerCase().replace(/[^\w\sáéíóúñü]/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  
  if (words.length === 0) return null;
  
  // Diccionario semántico expandido
  const semanticMap = {
    // Ciencias
    ciencia: ['química', 'física', 'biología', 'reacción', 'elemento', 'molécula', 'átomo', 'ion', 'enlace', 'valencia', 'laboratorio', 'experimento', 'análisis', 'compuesto', 'fórmula', 'tabla', 'periódica', 'ácido', 'base', 'sal', 'óxido'],
    // Negocios
    negocio: ['empresa', 'marketing', 'finanzas', 'estrategia', 'mercado', 'cliente', 'producto', 'servicio', 'venta', 'plan', 'modelo', 'canvas', 'roi', 'inversión', 'presupuesto', 'ganancia', 'costo', 'precio'],
    // Educación  
    educacion: ['estudiante', 'aprender', 'enseñar', 'clase', 'curso', 'estudio', 'conocimiento', 'educación', 'formación', 'capacitación', 'profesor', 'maestro', 'alumno', 'escuela', 'universidad'],
    // Innovación
    innovacion: ['innovación', 'creatividad', 'diseño', 'tecnología', 'digital', 'desarrollo', 'prototipo', 'idea', 'solución', 'mejora', 'cambio', 'transformación', 'disrupción'],
    // Liderazgo
    liderazgo: ['liderazgo', 'equipo', 'gestión', 'dirección', 'motivación', 'coordinación', 'comunicación', 'colaboración', 'objetivo', 'meta', 'líder', 'manager', 'jefe']
  };
  
  // Crear vector de 25 dimensiones
  const embedding = new Array(25).fill(0);
  const wordFreq: { [key: string]: number } = {};
  
  // Contar frecuencias
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Análisis semántico por categorías (dimensiones 0-4)
  Object.entries(semanticMap).forEach(([category, keywords], index) => {
    let categoryScore = 0;
    keywords.forEach(keyword => {
      if (wordFreq[keyword]) {
        categoryScore += wordFreq[keyword] * 3;
      }
      // Buscar coincidencias parciales
      Object.keys(wordFreq).forEach(word => {
        if (word.includes(keyword) || keyword.includes(word)) {
          categoryScore += wordFreq[word] * 1.5;
        }
      });
    });
    embedding[index] = categoryScore;
  });
  
  // Características estructurales (dimensiones 5-9)
  embedding[5] = words.length; // Longitud
  embedding[6] = Object.keys(wordFreq).length; // Vocabulario único  
  embedding[7] = words.filter(w => w.length > 6).length; // Palabras largas
  embedding[8] = Math.max(...Object.values(wordFreq), 0); // Max frecuencia
  embedding[9] = Object.values(wordFreq).reduce((a, b) => a + b, 0) / Math.max(Object.keys(wordFreq).length, 1); // Freq promedio
  
  // Top 15 palabras más frecuentes (dimensiones 10-24)
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([,freq]) => freq);
  
  for (let i = 0; i < 15; i++) {
    embedding[10 + i] = topWords[i] || 0;
  }
  
  // Normalizar vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

// Función para buscar documentos similares usando búsqueda híbrida
async function findSimilarDocuments(query: string, documents: ProcessedDocument[], topK: number = 5): Promise<ProcessedDocument[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  if (queryEmbedding) {
    // Búsqueda por embeddings semánticos
    const similarities = await Promise.all(
      documents.map(async doc => {
        let docEmbedding = doc.embedding;
        
        // Generar embedding si no existe
        if (!docEmbedding) {
          const newEmbedding = await generateEmbedding(doc.content);
          docEmbedding = newEmbedding || undefined;
        }
        
        if (docEmbedding && queryEmbedding) {
          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          return { document: doc, similarity };
        }
        return { document: doc, similarity: 0 };
      })
    );
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.document);
  } else {
    // Fallback: Búsqueda inteligente por palabras clave con scoring mejorado
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    const scoredDocs = documents.map(doc => {
      let score = 0;
      const docContent = doc.content.toLowerCase();
      
      // Puntuación por palabras exactas (peso alto)
      queryWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = (docContent.match(regex) || []).length;
        score += matches * 5; // Mayor peso para coincidencias exactas
      });
      
      // Puntuación por palabras parciales (peso medio)
      queryWords.forEach(word => {
        if (word.length > 3) { // Solo para palabras de 4+ caracteres
          const partialRegex = new RegExp(word, 'g');
          const matches = (docContent.match(partialRegex) || []).length;
          score += matches * 2;
        }
      });
      
      // Bonus por proximidad de palabras
      for (let i = 0; i < queryWords.length - 1; i++) {
        const word1 = queryWords[i];
        const word2 = queryWords[i + 1];
        const index1 = docContent.indexOf(word1);
        const index2 = docContent.indexOf(word2);
        
        if (index1 !== -1 && index2 !== -1) {
          const distance = Math.abs(index1 - index2);
          if (distance < 50) score += 8; // Muy cerca
          else if (distance < 100) score += 4; // Cerca
          else if (distance < 200) score += 2; // Moderadamente cerca
        }
      }
      
      // Bonus por densidad de palabras clave
      if (queryWords.length > 1) {
        const foundWords = queryWords.filter(word => docContent.includes(word));
        const density = foundWords.length / queryWords.length;
        score += density * 10; // Bonus por cobertura de la consulta
      }
      
      // Normalizar por longitud del documento (evitar favorecer docs muy largos)
      const docLength = docContent.split(' ').length;
      score = score / Math.log(Math.max(docLength, 10)) * 100;
      
      return { document: doc, score };
    });
    
    return scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.document);
  }
}

// Función para dividir texto en chunks
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }
  
  return chunks;
}

// DEPRECATED: Esta función ha sido reemplazada por /api/classes/[classId]/documents/process
// que usa Supabase Vector Storage en lugar de archivos locales
/*
export async function processPDFDocument(filePath: string, classId: string) {
  try {
    console.log(`📄 Procesando PDF: ${filePath}`);
    
    // Verificar que el archivo existe usando fetch HEAD
    const headResponse = await fetch(filePath, { method: 'HEAD' });
    if (!headResponse.ok) {
      throw new Error(`El archivo no existe o no es accesible: ${headResponse.statusText}`);
    }
    
    // @ts-ignore - pdf2json no tiene tipos oficiales
    const PDFParser = (await import('pdf2json')).default;
    
    return new Promise<boolean>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('❌ Error parseando PDF:', errData.parserError);
        reject(errData.parserError);
      });
      
      pdfParser.on('pdfParser_dataReady', async (pdfData: any) => {
        try {
          // Extraer texto de todas las páginas
          let fullText = '';
          
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const r of text.R) {
                      if (r.T) {
                        try {
                          fullText += decodeURIComponent(r.T) + ' ';
                        } catch (e) {
                          // Si falla decodeURIComponent, usar el texto tal cual
                          fullText += r.T + ' ';
                        }
                      }
                    }
                  }
                }
              }
              fullText += '\n';
            }
          }
          
          console.log(`📝 Texto extraído: ${fullText.length} caracteres`);
          
          if (fullText.trim().length === 0) {
            throw new Error('No se pudo extraer texto del PDF');
          }
          
          // Dividir texto en chunks
          const chunks = splitTextIntoChunks(fullText, 1000, 200);
          console.log(`✂️ Documento dividido en ${chunks.length} fragmentos`);
          
          // Procesar documentos sin embeddings (por simplicidad)
          const processedDocs: ProcessedDocument[] = chunks.map((chunk, index) => ({
            content: chunk,
            metadata: {
              source: filePath,
              page: Math.floor(index / (pdfData.Pages.length / chunks.length))
            }
            // No generar embeddings por ahora
          }));

          // Crear directorio para almacenar documentos procesados
          const classDocsPath = path.join(CHROMA_PATH, classId);
          await fs.mkdir(classDocsPath, { recursive: true });
          
          // Guardar en archivo JSON con embeddings
          const fileName = path.basename(filePath, '.pdf') + '.json';
          const jsonPath = path.join(classDocsPath, fileName);
          await fs.writeFile(jsonPath, JSON.stringify(processedDocs, null, 2));
          
          console.log(`✅ Documento procesado y guardado en: ${jsonPath}`);
          resolve(true);
        } catch (error) {
          console.error('❌ Error procesando datos del PDF:', error);
          reject(error);
        }
      });
      
      pdfParser.loadPDF(filePath);
    });
  } catch (error) {
    console.error('❌ Error procesando documento:', error);
    throw error;
  }
}
*/

// Función para generar instrucciones específicas por tema
function getThemeSpecificInstructions(primaryTheme: string): string {
  const themeInstructions: { [key: string]: string } = {
    'Química': `
• **Identidad amigable:** "¡Hola! Soy especialista en química y me emociona ayudarte..."
• **Enfoque accesible:** Explica conceptos químicos complejos con analogías cotidianas
• **Experiencia compartida:** "Te cuento algo interesante que he visto en el lab..." / "Una vez trabajando con..."
• **Referencias inspiradoras:** Historias de Marie Curie, Linus Pauling contadas de manera motivadora
• **Ejemplos cercanos:** "¿Sabías que cuando cocinas estás haciendo química?" / "Es como cuando..."`,
    
    'Plan de Negocio': `
• **Identidad amigable:** "¡Qué genial! Como especialista en planes de negocio, me encanta este tema..."
• **Enfoque motivador:** "¿Sabes qué? Los mejores emprendedores que conozco..." / "Te cuento un secreto..."
• **Herramientas simples:** Canvas explicado como "un mapa de tu idea", FODA como "conocer tus súper poderes"
• **Casos inspiradores:** "Déjame contarte de una startup que..." / "Una historia que me gusta mucho..."
• **Consejos prácticos:** "Mi consejo de oro es..." / "Si tuviera que elegir una sola cosa..."`,
    
    'Marketing': `
• **Identidad entusiasta:** "¡Hola! Soy especialista en marketing y me fascina la creatividad..."
• **Enfoque divertido:** "El marketing es como contar historias geniales..." / "¿Has notado cómo Nike..."
• **Herramientas accesibles:** Redes sociales explicadas como "conversaciones", branding como "personalidad"
• **Casos emocionantes:** "¿Conoces la historia de cómo Coca-Cola..." / "Te va a encantar este ejemplo..."
• **Consejos creativos:** "Un truco que siempre funciona..." / "Lo que yo haría en tu lugar..."`,
    
    'Finanzas': `
• **Identidad cercana:** "¡Hola! Como especialista en finanzas, me gusta hacer los números fáciles..."
• **Enfoque práctico:** "Las finanzas son como administrar tu dinero personal, pero en grande..." 
• **Herramientas simples:** ROI explicado como "¿me conviene o no?", presupuesto como "plan de gastos inteligente"
• **Casos relacionables:** "Es como cuando ahorras para..." / "¿Has pensado en por qué las empresas..."
• **Consejos útiles:** "La regla de oro que siempre uso..." / "Te doy un consejo que me ha funcionado..."`,
    
    'Innovación': `
• **Enfoque disruptivo:** Pensamiento lateral, prototipado rápido, experimentación
• **Metodologías ágiles:** Design Thinking, SCAMPER, Lean Startup, MVP
• **Ejemplos innovadores:** Tesla, SpaceX, Apple, casos de transformación digital
• **Procesos:** Ideación, validación, iteración, escalamiento`,
    
    'Liderazgo': `
• **Enfoque humano:** Desarrollo de competencias, motivación, comunicación efectiva
• **Herramientas de gestión:** Feedback 360°, coaching, team building, OKRs
• **Líderes referentes:** Jack Ma, Satya Nadella, casos de transformación organizacional
• **Competencias:** Inteligencia emocional, toma de decisiones, gestión del cambio`,
    
    'Emprendimiento': `
• **Enfoque oportunista:** Identificación de nichos, validación de mercado, escalabilidad
• **Ecosistema startup:** Pitch decks, business angels, venture capital, aceleradoras
• **Emprendedores icónicos:** Elon Musk, Sara Blakely, casos de unicornios latinoamericanos
• **Mindset:** Growth mindset, resiliencia, networking, pivoteo estratégico`
  };
  
  return themeInstructions[primaryTheme] || `
• **Enfoque integral:** Combina conceptos de múltiples áreas empresariales
• **Metodologías generales:** FODA, Canvas, Design Thinking, análisis estratégico
• **Ejemplos diversos:** Casos de diferentes industrias y contextos empresariales
• **Perspectiva holística:** Conecta teoría con práctica empresarial`;
}

export async function queryDocuments(classId: string, query: string, className?: string) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no configurada');
    }

    // Leer todos los documentos procesados de la clase
    const classDocsPath = path.join(CHROMA_PATH, classId);
    let allDocs: ProcessedDocument[] = [];
    let documentFiles: string[] = [];
    
    try {
      const files = await fs.readdir(classDocsPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const filePath = path.join(classDocsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const docs = JSON.parse(content) as ProcessedDocument[];
        allDocs = allDocs.concat(docs);
        documentFiles.push(file.replace('.json', ''));
      }
    } catch (error) {
      console.log('No se encontraron documentos procesados');
      return {
        answer: `Lo siento, no encontré documentos procesados para esta clase. 

**Para que pueda ayudarte mejor:**
• Tu profesor debe subir documentos PDF a la clase
• Los documentos deben procesarse automáticamente
• Una vez procesados, podré responder preguntas específicas sobre su contenido

**Mientras tanto puedo ayudarte con:**
• Conceptos generales de ${className || 'la materia'}
• Metodologías empresariales estándar
• Ejemplos de empresas exitosas
• Técnicas de emprendimiento

¿En qué tema específico te gustaría que te ayude?`,
        sources: []
      };
    }

    if (allDocs.length === 0) {
      return {
        answer: "Lo siento, no hay contenido disponible en los documentos de esta clase.",
        sources: []
      };
    }

    console.log(`📚 Documentos encontrados: ${documentFiles.join(', ')}`);
    
    // Usar búsqueda semántica para encontrar documentos relevantes
    console.log(`🔍 Buscando documentos similares para: "${query}"`);
    const relevantDocs = await findSimilarDocuments(query, allDocs, 5);
    
    // Generar persona adaptativa basada en el contenido
    const adaptiveMentorPersona = generateAdaptiveMentorPersona(allDocs, className);
    
    // Format context with document information
    const context = relevantDocs.length > 0 
      ? relevantDocs.map((doc, idx) => 
          `[Fragmento ${idx + 1} - Fuente: ${path.basename(doc.metadata.source)}]\n${doc.content}`
        ).join('\n\n---\n\n')
      : 'No se encontraron fragmentos específicamente relevantes, pero puedo ayudarte con el contenido general de la clase.';
    
    const documentsList = documentFiles.length > 0 
      ? `\n\nDocumentos disponibles en esta clase: ${documentFiles.join(', ')}`
      : '';
    
    // Generar contexto temático específico
    const contentAnalysis = analyzeClassContent(allDocs);
    const detectedThemes = contentAnalysis.themes.length > 0 
      ? contentAnalysis.themes.slice(0, 3).join(', ') 
      : 'Cultura Empresarial General';
    const keyTerms = contentAnalysis.keywords.slice(0, 8).join(', ');
    
    const prompt = `${adaptiveMentorPersona}

CONTEXTO DE LA CLASE: "${className || 'Clase empresarial'}"${documentsList}

CONTENIDO RELEVANTE DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL ESTUDIANTE: ${query}

INSTRUCCIONES DE ESPECIALIZACIÓN:
${getThemeSpecificInstructions(contentAnalysis.themes[0] || 'Cultura Empresarial')}

INSTRUCCIONES PARA SER UN ESPECIALISTA AMIGABLE Y CONVERSACIONAL:
1. **SALUDA con entusiasmo** identificándote como especialista: "¡Hola! Como especialista en..."
2. **Explica conceptos complejos** de forma simple usando analogías cotidianas
3. **Comparte experiencias** de manera cercana: "Te cuento algo genial que he visto..."
4. **Usa ejemplos familiares**: "Es como cuando tú...", "¿Has notado que...?"
5. **Sé motivador y positivo**: "¡Me encanta que preguntes esto!", "¡Qué buena pregunta!"
6. **Da consejos prácticos**: "Mi consejo de oro...", "Lo que yo haría..."
7. **Termina animando**: "¡Espero haberte ayudado!", "¿Te quedó claro? ¡Pregúntame más!"
8. **Usa emojis ocasionales** para ser más expresivo
9. Responde basándote PRINCIPALMENTE en el contenido específico de los documentos de clase
10. Adapta automáticamente tu enfoque al tema detectado pero manteniendo siempre un tono amigable

- Si piden ejemplos de empresas (como Google, Apple, Tesla), puedes mencionarlos aunque no estén en los documentos
- Para METODOLOGÍAS y TÉCNICAS emprendedoras, incluye herramientas específicas como:
  * SCAMPER (Sustituir, Combinar, Adaptar, Modificar, Proponer, Eliminar, Reorganizar)
  * Design Thinking (Empatizar, Definir, Idear, Prototipar, Testear)
  * Lean Startup (Build-Measure-Learn)
  * Brainstorming y técnicas de creatividad
  * Canvas de modelo de negocio
- Para CONCEPTOS ESPECÍFICOS, incluye sus tipos/clasificaciones importantes:
  * Ventaja competitiva: precio, diferenciación, innovación, nicho
  * Análisis FODA: fortalezas, oportunidades, debilidades, amenazas
  * Plan de negocio: misión, visión, objetivos, valores
- FORMATO Y ESTRUCTURA CRÍTICA - SIGUE EXACTAMENTE este formato:
  * Para solicitudes de ayuda/escritura (como "Ayúdame a escribir..."):
    1. **Título principal** con la tarea
    2. **Elementos/Componentes** en lista numerada
    3. **Herramientas** en viñetas con explicación breve
    4. **Plantilla/Estructura** paso a paso
    5. Frase de cierre motivadora
  * Para preguntas "¿Qué es...?":
    - Definición clara en 1 párrafo
    - **Elementos clave** en formato de viñetas
    - **Ejemplo** concreto de empresa conocida
  * SIEMPRE usa:
    - Títulos en **negrita**
    - Listas numeradas para pasos
    - Viñetas (•) para elementos
    - Separación clara entre secciones
    - Estructura visual limpia y organizada
- Para DEFINICIONES y CONCEPTOS teóricos, usa SOLO el contexto de los documentos
- REGLA DE BREVEDAD: Para preguntas simples de definición ("¿Qué es...?"), responde en máximo 2 párrafos cortos
- **REDIRECCIÓN DE TEMA (CT-E33):**
  * Si la pregunta es sobre temas completamente ajenos a cultura empresarial
  * Como: medicina, análisis médico, deportes, cocina, tecnología no relacionada con negocios
  * RESPONDE: "Ese tema no pertenece a cultura empresarial. Mi especialidad es ayudarte con temas como: desarrollo de planes de negocio, metodologías emprendedoras (SCAMPER, Design Thinking), análisis empresarial (FODA), casos de empresas exitosas, y conceptos de emprendimiento. ¿En qué tema empresarial puedo ayudarte?"
- **MANEJO DE ERRORES DE FORMATO (CT-E32):**
  * Si la pregunta es confusa, incomprensible o tiene formato extraño
  * Si contiene caracteres especiales sin sentido (???, símbolos raros)
  * Si es demasiado vaga o ambigua
  * RESPONDE: "Disculpa, no logro entender bien tu pregunta. ¿Podrías reformularla o ser más específico sobre qué tema de cultura empresarial te interesa? Por ejemplo: definiciones, metodologías, ejemplos de empresas, etc."
- Sé claro, conciso, motivador y siempre educativo
- Para definiciones: da la definición + 1-2 puntos clave + ejemplo breve
- Conecta los ejemplos generales con los conceptos de los documentos cuando sea posible

EJEMPLOS ESPECÍFICOS por tipo de pregunta:

Para "Ayúdame a escribir la parte de contexto de mi plan de negocio":
"Para escribir el **contexto de tu plan de negocio**, necesitas analizar el entorno donde operará tu empresa.

**Elementos del Contexto:**
1. **Análisis de Mercado** - Identifica clientes, comportamiento y preferencias
2. **Competencia** - Analiza competidores directos e indirectos
3. **Tendencias Económicas y Sociales** - Factores que afectan tu negocio
4. **Regulaciones** - Leyes que rigen tu industria

**Herramientas para Analizar:**
• **Análisis FODA** - Fortalezas, Oportunidades, Debilidades, Amenazas
• **SCAMPER** - Sustituir, Combinar, Adaptar, Modificar, Proponer, Eliminar, Reorganizar
• **Design Thinking** - Empatizar, Definir, Idear, Prototipar, Testear

**Plantilla Estructurada:**
1. Descripción del mercado objetivo
2. Análisis de competidores principales
3. Tendencias relevantes del sector
4. Oportunidades identificadas
5. Riesgos y amenazas potenciales

Esta estructura te ayudará a crear un contexto sólido para tu plan de negocio."

Para preguntas de definición simple como "¿Qué es la misión?":
"La **misión** es la razón de ser de una empresa, su propósito fundamental. Define qué hace la organización y para quién lo hace.
**Elementos clave:** propósito, objetivos, valores, público objetivo.
**Ejemplo:** Google - "Organizar la información del mundo y hacerla accesible para todos"."

Para errores de formato o preguntas confusas (CT-E32) como "???" o texto incomprensible:
"Disculpa, no logro entender bien tu pregunta. ¿Podrías reformularla o ser más específico sobre qué tema de cultura empresarial te interesa? 

Por ejemplo:
• Definiciones (¿Qué es la misión?, ¿Qué es FODA?)
• Metodologías (Design Thinking, SCAMPER)  
• Ejemplos de empresas exitosas
• Desarrollo de planes de negocio

¡Estoy aquí para ayudarte con cualquier tema empresarial! 😊"

Para preguntas fuera de tema (CT-E33 y CT-E47) como "Háblame del análisis médico" o "Enséñame a programar en Python":
"Ese tema no pertenece a cultura empresarial. Mi especialidad es ayudarte con temas como:

• **Desarrollo de planes de negocio** (misión, visión, objetivos)
• **Metodologías emprendedoras** (SCAMPER, Design Thinking, Lean Startup)  
• **Análisis empresarial** (FODA, competencia, mercado)
• **Casos de empresas exitosas** (Google, Apple, Tesla, Amazon)
• **Conceptos de emprendimiento** (innovación, ventaja competitiva)

¿En qué tema empresarial puedo ayudarte?"

Para aplicaciones prácticas de colores/branding (CT-E35) como "¿Qué colores debería usar para un negocio de tecnología?":
"Para un **negocio de tecnología**, te recomiendo esta paleta de colores:

**Colores Principales:**
• **Azul** - Transmite confianza, profesionalismo y seguridad tecnológica
• **Gris** - Sugiere modernidad, sofisticación y neutralidad técnica  
• **Blanco** - Representa claridad, simplicidad y diseño limpio

**Justificación Emocional:**
- El azul genera **confianza** en servicios tecnológicos (usado por Microsoft, IBM, Facebook)
- El gris aporta **seriedad** y profesionalismo técnico
- El blanco facilita la **legibilidad** y transmite innovación minimalista

**Ejemplos exitosos:** Apple (gris/blanco), Google (azul/blanco), Microsoft (azul)"

Para consultas conceptuales de naming (CT-E36, CT-E38) como "¿Qué es el naming?" o "¿Qué es el método fonético?":
"El **naming** es el proceso estratégico de creación de nombres de marca que conecten emocionalmente con el público objetivo.

**Elementos clave:** memorabilidad, pronunciación, significado, diferenciación
**Ejemplo:** Google (jugada con 'googol' = número 1 seguido de 100 ceros)"

Para métodos de naming específicos - **Método Fonético:**
"Se centra en la **sonoridad y recordación** del nombre. Busca crear nombres que sean fáciles de pronunciar y recordar por su musicalidad.

**Características:** ritmo, rima, aliteración, sonidos agradables
**Ejemplo:** Coca-Cola (repetición del sonido 'co-ca')"

Para ejemplos de método acronímico (CT-E37):
"**Ejemplos de método acronímico:**
• **IKEA** - Ingvar Kamprad Elmtaryd Agunnaryd (fundador + lugares)
• **NASA** - National Aeronautics and Space Administration  
• **PEMEX** - Petróleos Mexicanos
• **BMW** - Bayerische Motoren Werke (Fábricas Bávaras de Motores)"

CASOS ADICIONALES ESPECÍFICOS:

Para creación de nombres semánticos (CT-E39):
"**Nombre sugerido:** EduFlow
**Justificación:** 'Edu' (educación) + 'Flow' (flujo continuo de aprendizaje). Transmite movimiento dinámico y proceso educativo fluido."

Para conexión misión-valores (CT-E40):
"La **misión** y los **valores** deben tener coherencia cultural completa:
• La misión define **QUÉ hacemos**
• Los valores guían **CÓMO lo hacemos**
• Juntos crean la **identidad empresarial**
**Ejemplo:** Si la misión es 'democratizar la educación', los valores deben incluir accesibilidad e inclusión."

Para diferencia misión vs visión (CT-E41):
"**Misión vs Visión:**
| Aspecto | Misión | Visión |
|---------|--------|--------|
| Tiempo | Presente | Futuro |
| Enfoque | Qué hacemos | Qué aspiramos ser |
| Propósito | Razón de existir | Meta a largo plazo |"

Para creatividad emprendedora (CT-E42, CT-E43):
"La **creatividad emprendedora** es la capacidad de generar ideas innovadoras para resolver problemas y crear oportunidades de negocio.

**Ejemplo en ingeniería:** Tesla reinventó la industria automotriz combinando ingeniería eléctrica + software + diseño sustentable, creando un ecosistema tecnológico completo."

Para importancia del contexto (CT-E44):
"Analizar el **contexto** es crucial porque:
• **Reduce riesgos** al identificar amenazas temprano
• **Optimiza recursos** enfocándose en oportunidades reales  
• **Facilita planificación** estratégica basada en datos
• **Aumenta probabilidad** de éxito empresarial"

Para objetivos SMART (CT-E45, CT-E46):
"Los objetivos **SMART** son:
• **S**pecífico • **M**edible • **A**lcanzable • **R**elevante • **T**empo definido

**Ejemplo para app de salud:**
'Aumentar la base de usuarios activos de 10,000 a 25,000 usuarios registrados que usen la app al menos 3 veces por semana durante los próximos 6 meses, mediante estrategias de marketing digital y mejoras en UX.'"

Para comparación metodologías (CT-E48):
"**Lean Startup vs Design Thinking:**
| Lean Startup | Design Thinking |
|-------------|----------------|
| **Enfoque:** Validación rápida | **Enfoque:** Empatía con usuario |
| **Proceso:** Build-Measure-Learn | **Proceso:** Empatizar-Definir-Idear-Prototipar-Testear |
| **Objetivo:** Producto mínimo viable | **Objetivo:** Solución centrada en usuario |"

Tu respuesta como mentor experto en cultura empresarial:`;

    // Intentar con Groq primero, HuggingFace como fallback
    let response;
    let usingHuggingFace = false;
    
    try {
      response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.7,
            max_tokens: 1024
          })
        }
      );
      
      if (!response.ok && response.status === 429) {
        console.log('⚠️ Groq rate limit alcanzado, usando respuesta estática');
        
        return {
          answer: "🚫 **Límite de consultas diario alcanzado**\n\nHemos alcanzado el límite de consultas por hoy. El servicio estará disponible nuevamente mañana.\n\n**Mientras tanto puedes:**\n• Revisar los documentos de clase descargados\n• Consultar tus apuntes\n• Preparar preguntas para mañana\n\n¡Gracias por tu comprensión! 😊",
          sources: []
        };
      }
    } catch (groqError) {
      console.log('⚠️ Error en Groq, usando respuesta estática como fallback');
      
      // Devolver mensaje informativo cuando Groq falle
      return {
        answer: "🚫 **Servicio temporalmente no disponible**\n\nEl servicio de IA está experimentando problemas temporales. Esto puede deberse a:\n\n• **Límites de uso** alcanzados\n• **Mantenimiento** del servicio\n• **Alta demanda** en los servidores\n\n**Mientras tanto puedes:**\n• Revisar los documentos descargados de la clase\n• Consultar tus apuntes\n• Intentar nuevamente en unos minutos\n\n¡Disculpas por las molestias! 😊",
        sources: relevantDocs.map(doc => ({
          pageContent: doc.content.substring(0, 200) + '...',
          metadata: doc.metadata
        }))
      };
    }

    if (!usingHuggingFace) {
      if (!response!.ok) {
        const errorData = await response!.json();
        console.error('Groq API Error details:', errorData);
        
        // Manejar límite de rate limit específicamente
        if (response!.status === 429 && errorData.error?.code === 'rate_limit_exceeded') {
          return {
            answer: "🚫 **Límite de consultas diario alcanzado**\n\nHemos alcanzado el límite de consultas por hoy. El servicio estará disponible nuevamente mañana.\n\n**Mientras tanto puedes:**\n• Revisar los documentos de clase descargados\n• Consultar tus apuntes\n• Preparar preguntas para mañana\n\n¡Gracias por tu comprensión! 😊",
            sources: []
          };
        }
        
        throw new Error(`API Error: ${response!.status} ${response!.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response!.json();
      const answer = data.choices?.[0]?.message?.content || 'No pude generar una respuesta';
      
      return {
        answer,
        sources: relevantDocs.map(doc => ({
          pageContent: doc.content.substring(0, 200) + '...',
          metadata: doc.metadata
        }))
      };
    }
  } catch (error) {
    console.error('Error consultando documentos:', error);
    
    // Si el error contiene información de rate limit, devolver mensaje amigable
    if (error instanceof Error && error.message.includes('rate_limit_exceeded')) {
      return {
        answer: "🚫 **Límite de consultas diario alcanzado**\n\nHemos alcanzado el límite de consultas por hoy. El servicio estará disponible nuevamente mañana.\n\n**Mientras tanto puedes:**\n• Revisar los documentos de clase descargados\n• Consultar tus apuntes\n• Preparar preguntas para mañana\n\n¡Gracias por tu comprensión! 😊",
        sources: []
      };
    }
    
    throw error;
  }
}