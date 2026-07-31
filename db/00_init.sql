
CREATE TABLE IF NOT EXISTS documents (
    id            BIGSERIAL   PRIMARY KEY,
    title         TEXT        NOT NULL,
    file_name     TEXT        NOT NULL,
    doc_type      TEXT        NOT NULL,  
    owner_id      BIGINT      NOT NULL,
    owner_name    TEXT        NOT NULL,
    file_size     BIGINT      NOT NULL,   
    storage_path  TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

