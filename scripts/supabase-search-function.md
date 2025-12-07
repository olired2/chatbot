# SQL para crear la función de búsqueda vectorial en Supabase

Ejecuta esto en el SQL Editor de Supabase:

```sql
-- Función para buscar embeddings similares
create or replace function search_embeddings(
  p_class_id text,
  p_embedding vector(384),
  p_limit int default 5
)
returns table (
  id bigint,
  class_id text,
  document_id text,
  chunk_index int,
  content text,
  similarity float8
) as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.class_id,
    document_embeddings.document_id,
    document_embeddings.chunk_index,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> p_embedding) as similarity
  from document_embeddings
  where document_embeddings.class_id = p_class_id
  order by document_embeddings.embedding <=> p_embedding
  limit p_limit;
end;
$$ language plpgsql;
```

El operador `<=>` es para distancia coseno, y `1 - distancia` da la similitud (0-1).
