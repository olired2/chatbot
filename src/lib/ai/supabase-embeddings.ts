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
 * Genera embedding para un texto usando Jina AI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const jinaApiKey = process.env.JINA_API_KEY;
    
    if (!jinaApiKey) {
      throw new Error('JINA_API_KEY no configurada');
    }
    
    console.log(`⏳ Generando embedding con Jina AI...`);
    
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jinaApiKey}`,
      },
      body: JSON.stringify({
        model: 'jina-embeddings-v2-base-en',
        input: [text],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Jina error:', data);
      throw new Error(`Jina API error: ${JSON.stringify(data)}`);
    }

    if (data.data && data.data[0] && data.data[0].embedding) {
      console.log(`✅ Embedding generado exitosamente (${data.data[0].embedding.length} dimensiones)`);
      return data.data[0].embedding;
    }

    throw new Error('No embedding returned from Jina');
  } catch (error) {
    console.error('❌ Error generando embedding:', error);
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
      console.error('Error de RPC en Supabase:', error);
      // Si no hay embeddings aún, devolver array vacío en lugar de fallar
      if (error.message && error.message.includes('function')) {
        console.warn('Función search_embeddings no existe aún. Asegúrate de ejecutar el SQL en Supabase.');
        return [];
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn(`No se encontraron documentos para la clase ${classId}`);
      return [];
    }

    return data.map((result: any) => ({
      content: result.content,
      similarity: result.similarity,
      documentId: result.document_id,
    }));
  } catch (error) {
    console.error('Error buscando documentos:', error);
    // Retornar array vacío en lugar de lanzar excepción
    // Esto permite que el chatbot funcione incluso sin documentos indexados
    return [];
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
