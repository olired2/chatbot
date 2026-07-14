import { DocumentChunkModel } from '@/models/DocumentChunk';
import connectDB from '@/lib/db/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DocumentChunk {
  classId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // PRO: Uso de Redes Neuronales (Google Gemini) si está configurado
  if (process.env.GOOGLE_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.warn("⚠️ Error con Google Gemini, usando modelo básico de respaldo:", error);
      // Fallback al modelo heurístico si falla la API
    }
  }

  // FALLBACK: Modelo Heurístico (Estadístico / Matemático)
  const cleanText = text.toLowerCase().replace(/[^\w\sáéíóúñü]/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 2);
  
  const semanticMap = {
    ciencia: ['química', 'física', 'biología', 'reacción', 'elemento', 'molécula', 'átomo', 'ion', 'enlace', 'valencia', 'laboratorio', 'experimento', 'análisis', 'compuesto', 'fórmula', 'tabla', 'periódica', 'ácido', 'base', 'sal', 'óxido'],
    negocio: ['empresa', 'marketing', 'finanzas', 'estrategia', 'mercado', 'cliente', 'producto', 'servicio', 'venta', 'plan', 'modelo', 'canvas', 'roi', 'inversión', 'presupuesto', 'ganancia', 'costo', 'precio'],
    educacion: ['estudiante', 'aprender', 'enseñar', 'clase', 'curso', 'estudio', 'conocimiento', 'educación', 'formación', 'capacitación', 'profesor', 'maestro', 'alumno', 'escuela', 'universidad'],
    innovacion: ['innovación', 'creatividad', 'diseño', 'tecnología', 'digital', 'desarrollo', 'prototipo', 'idea', 'solución', 'mejora', 'cambio', 'transformación', 'disrupción'],
    liderazgo: ['liderazgo', 'equipo', 'gestión', 'dirección', 'motivación', 'coordinación', 'comunicación', 'colaboración', 'objetivo', 'meta', 'líder', 'manager', 'jefe']
  };
  
  const embedding = new Array(25).fill(0);
  if (words.length === 0) return embedding;
  
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => { wordFreq[word] = (wordFreq[word] || 0) + 1; });
  
  Object.entries(semanticMap).forEach(([category, keywords], index) => {
    let categoryScore = 0;
    keywords.forEach(keyword => {
      if (wordFreq[keyword]) categoryScore += wordFreq[keyword] * 3;
      Object.keys(wordFreq).forEach(word => {
        if (word.includes(keyword) || keyword.includes(word)) categoryScore += wordFreq[word] * 1.5;
      });
    });
    embedding[index] = categoryScore;
  });
  
  embedding[5] = words.length;
  embedding[6] = Object.keys(wordFreq).length;
  embedding[7] = words.filter(w => w.length > 6).length;
  embedding[8] = Math.max(...Object.values(wordFreq), 0);
  embedding[9] = Object.values(wordFreq).reduce((a, b) => a + b, 0) / Math.max(Object.keys(wordFreq).length, 1);
  
  const topWords = Object.entries(wordFreq).sort(([,a], [,b]) => b - a).slice(0, 15).map(([,freq]) => freq);
  for (let i = 0; i < 15; i++) { embedding[10 + i] = topWords[i] || 0; }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}

export async function storeEmbeddings(chunks: DocumentChunk[]): Promise<void> {
  await connectDB();
  await DocumentChunkModel.insertMany(chunks.map(chunk => ({
    classId: chunk.classId,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    embedding: chunk.embedding
  })));
  console.log(`✅ ${chunks.length} embeddings almacenados en MongoDB`);
}

export async function searchDocuments(
  classId: string,
  query: string,
  limit: number = 5
) {
  await connectDB();
  const queryEmbedding = await generateEmbedding(query);
  const chunks = await DocumentChunkModel.find({ classId }).lean();
  
  if (!chunks.length) return [];
  
  const results = chunks.map((chunk: any) => ({
    content: chunk.content,
    documentId: chunk.documentId,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function deleteDocumentEmbeddings(classId: string, documentId: string): Promise<void> {
  await connectDB();
  await DocumentChunkModel.deleteMany({ classId, documentId });
  console.log(`✅ Embeddings del documento ${documentId} eliminados de MongoDB`);
}
