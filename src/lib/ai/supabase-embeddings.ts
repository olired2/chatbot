import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

let supabase: any = null;
let groq: any = null;

function initializeClients() {
  if (supabase && groq) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !groqApiKey) {
    throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY');
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey);
  groq = new Groq({ apiKey: groqApiKey });
}

export interface DocumentChunk {
  classId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

/**
 * Genera embedding para un texto usando Groq
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    initializeClients();
    const response = await groq.embeddings.create({
      model: 'nomic-embed-text-v1.5',
      input: text,
    });

    const embedding = response.data[0].embedding;
    return Array.isArray(embedding) ? embedding : JSON.parse(embedding as string);
  } catch (error) {
    console.error('Error generando embedding:', error);
    throw error;
  }
}

/**
 * Almacena chunks con embeddings en Supabase
 */
export async function storeEmbeddings(chunks: DocumentChunk[]): Promise<void> {
  try {
    initializeClients();
    const { error } = await supabase
      .from('document_embeddings')
      .insert(
        chunks.map(chunk => ({
          class_id: chunk.classId,
          document_id: chunk.documentId,
          chunk_index: chunk.chunkIndex,
          content: chunk.content,
          embedding: chunk.embedding,
        }))
      );

    if (error) {
      throw error;
    }

    console.log(`✅ ${chunks.length} embeddings almacenados en Supabase`);
  } catch (error) {
    console.error('Error almacenando embeddings:', error);
    throw error;
  }
}

/**
 * Busca documentos relevantes usando búsqueda vectorial
 */
export async function searchDocuments(
  classId: string,
  query: string,
  limit: number = 5
): Promise<
  Array<{
    content: string;
    similarity: number;
    documentId: string;
  }>
> {
  try {
    initializeClients();
    // Generar embedding de la query
    const queryEmbedding = await generateEmbedding(query);

    // Buscar en Supabase usando similitud vectorial
    const { data, error } = await supabase.rpc('search_embeddings', {
      p_class_id: classId,
      p_embedding: queryEmbedding,
      p_limit: limit,
    });

    if (error) {
      throw error;
    }

    return (data || []).map((result: any) => ({
      content: result.content,
      similarity: result.similarity,
      documentId: result.document_id,
    }));
  } catch (error) {
    console.error('Error buscando documentos:', error);
    throw error;
  }
}

/**
 * Elimina embeddings de un documento
 */
export async function deleteDocumentEmbeddings(
  classId: string,
  documentId: string
): Promise<void> {
  try {
    initializeClients();
    const { error } = await supabase
      .from('document_embeddings')
      .delete()
      .eq('class_id', classId)
      .eq('document_id', documentId);

    if (error) {
      throw error;
    }

    console.log(`✅ Embeddings del documento ${documentId} eliminados`);
  } catch (error) {
    console.error('Error eliminando embeddings:', error);
    throw error;
  }
}
