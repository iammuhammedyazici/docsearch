
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS document_search (
    document_id  BIGINT   PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    search_text  TEXT     NOT NULL,   
    content_hash CHAR(64) NOT NULL    
);

CREATE INDEX IF NOT EXISTS idx_docsearch_trgm
    ON document_search USING gin (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_docsearch_hash
    ON document_search (content_hash);

INSERT INTO document_search (document_id, search_text, content_hash)
SELECT d.id,
       unaccent(lower(d.title || ' ' || d.file_name)),
       encode(sha256((d.file_name || d.file_size::text)::bytea), 'hex')
FROM documents d
ON CONFLICT (document_id) DO UPDATE
   SET search_text  = EXCLUDED.search_text,
       content_hash = EXCLUDED.content_hash;

