-- FourlinQ Chatbot & Knowledge Base — Migration 003
-- Requires pgvector extension
-- Run: psql -U <user> -d fourlinq -f server/migrations/003_chatbot.sql

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Knowledge Base (groups of knowledge)
-- ============================================

CREATE TABLE knowledge_base (
    knowledge_base_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    description TEXT,
    kb_type TEXT, -- 'faq'|'product'|'policy'|'educational'|'objection'
    is_active BOOLEAN DEFAULT true,
    version SMALLINT DEFAULT 1,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Knowledge Chunks (actual content for RAG retrieval)
-- Uses vector(768) for Gemini gemini-embedding-001
-- ============================================

CREATE TABLE knowledge_chunk (
  knowledge_chunk_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  knowledge_base_id   BIGINT NOT NULL REFERENCES knowledge_base(knowledge_base_id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  content_type        TEXT,
    -- 'fact'|'faq'|'objection_response'|'product_spec'|'comparison'|'process'
  tags                TEXT[],
  embedding           vector(768),         -- pgvector, Gemini gemini-embedding-001
  product_id          BIGINT REFERENCES product(product_id),
  is_active           BOOLEAN DEFAULT true,
  version             SMALLINT DEFAULT 1,
  source_url          TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Chatbot Sessions
-- ============================================

CREATE TABLE chatbot_session (
    chatbot_session_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    session_token TEXT NOT NULL UNIQUE,
    channel TEXT DEFAULT 'website',
    visitor_id TEXT,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    message_count SMALLINT DEFAULT 0,
    model_used TEXT DEFAULT 'gemini-2.0-flash',
    tokens_used INT DEFAULT 0,
    lead_captured BOOLEAN DEFAULT false,
    meta JSONB DEFAULT '{}'
);

-- ============================================
-- Chatbot Messages
-- ============================================

CREATE TABLE chatbot_message (
  chatbot_message_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chatbot_session_id    BIGINT NOT NULL REFERENCES chatbot_session(chatbot_session_id) ON DELETE CASCADE,
  role                  TEXT NOT NULL,       -- 'user'|'assistant'|'system'
  content               TEXT NOT NULL,
  intent                TEXT,
  knowledge_chunks_used BIGINT[],
  confidence            NUMERIC(4,3),
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Chatbot Feedback (thumbs up/down)
-- ============================================

CREATE TABLE chatbot_feedback (
    chatbot_feedback_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chatbot_session_id BIGINT NOT NULL REFERENCES chatbot_session (chatbot_session_id) ON DELETE CASCADE,
    chatbot_message_id BIGINT REFERENCES chatbot_message (chatbot_message_id),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    feedback_type TEXT, -- 'thumbs_up'|'thumbs_down'
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_kb_embedding ON knowledge_chunk USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 10);

CREATE INDEX idx_kb_active ON knowledge_chunk (knowledge_base_id, is_active);

CREATE INDEX idx_kb_tags ON knowledge_chunk USING GIN (tags);

CREATE INDEX idx_chatbot_session_token ON chatbot_session (session_token);

CREATE INDEX idx_chatbot_message_session ON chatbot_message (
    chatbot_session_id,
    created_at
);