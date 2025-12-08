-- ====================================
-- Script de configuración para Supabase
-- Crear tabla de embeddings para el chatbot
-- ====================================

-- 1. Habilitar la extensión vector (para embeddings)
create extension if not exists vector;

-- 2. Crear tabla para almacenar embeddings de documentos
create table if not exists document_embeddings (
  id bigserial primary key,
  class_id text not null,
  document_id text not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(768) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Crear índice para búsqueda de similitud vectorial (más rápida)
create index if not exists document_embeddings_embedding_idx 
  on document_embeddings 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Crear índices para búsquedas por clase y documento
create index if not exists document_embeddings_class_id_idx 
  on document_embeddings(class_id);

create index if not exists document_embeddings_document_id_idx 
  on document_embeddings(document_id);

-- 5. Verificar que la tabla se creó correctamente
select 'Tabla document_embeddings creada exitosamente ✅' as status;
