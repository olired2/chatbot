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
 * Genera embedding para un texto usando Hugging Face (intfloat/e5-small-v2)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const hfToken = process.env.HUGGINGFACE_API_KEY;
    
    if (!hfToken) {
      throw new Error('HUGGINGFACE_API_KEY no configurada');
    }
    
    const response = await fetch(
      'https://router.huggingface.co/inference/intfloat/e5-small-v2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error HuggingFace:', data);
      throw new Error(`Error generando embedding: ${JSON.stringify(data)}`);
    }
    
    // Verificar que la respuesta es un array de embeddings
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0];
    }
    
    throw new Error(`Invalid embedding response format: ${JSON.stringify(data)}`);
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
