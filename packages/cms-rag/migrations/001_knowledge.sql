-- cms-rag · Migration 001: Knowledge base for RAG (pgvector).
-- Generic — drop into any project that wants a Claude-style retrieval chatbot.
--
-- Pre-req: `CREATE EXTENSION IF NOT EXISTS vector;` and an `organization` table.
-- (Or replace organization_id with whatever your tenant root is.)

BEGIN;

CREATE TABLE IF NOT EXISTS knowledge_base (
    knowledge_base_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id   BIGINT NOT NULL,
    name              TEXT NOT NULL,
    description       TEXT,
    kb_type           TEXT,         -- 'faq' | 'product' | 'policy' | 'educational' | 'objection' | ...
    is_active         BOOLEAN DEFAULT true,
    version           SMALLINT DEFAULT 1,
    meta              JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE knowledge_base IS
    'A grouping of related knowledge chunks (FAQ, product facts, brand voice, etc.) used by the RAG chatbot.';

CREATE TABLE IF NOT EXISTS knowledge_chunk (
    knowledge_chunk_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    knowledge_base_id  BIGINT NOT NULL REFERENCES knowledge_base (knowledge_base_id) ON DELETE CASCADE,
    title              TEXT NOT NULL,
    content            TEXT NOT NULL,
    content_type       TEXT,        -- 'fact' | 'faq' | 'product_spec' | 'comparison' | 'voice_sample' | ...
    tags               TEXT[],
    embedding          vector(768), -- pgvector; default 768 dims (Gemini Matryoshka)
    product_id         BIGINT,      -- optional cross-ref; nullable
    is_active          BOOLEAN DEFAULT true,
    version            SMALLINT DEFAULT 1,
    source_url         TEXT,        -- 'cms://{kind}/{id}' or external URL — see kb-sync.ts
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE knowledge_chunk IS
    'Individual passages indexed for vector similarity search. One row per chunk, one source_url per row (used by kb-sync to dedupe).';

CREATE INDEX IF NOT EXISTS idx_knowledge_chunk_base   ON knowledge_chunk (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunk_active ON knowledge_chunk (knowledge_base_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_chunk_source ON knowledge_chunk (source_url);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunk_embed  ON knowledge_chunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMIT;
