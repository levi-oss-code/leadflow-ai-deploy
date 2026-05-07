-- ==========================================
-- Migration 003: pgvector Setup
-- Enables vector embeddings for AI features
-- ==========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for AI-generated content embeddings
CREATE TABLE IF NOT EXISTS public.ai_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('outreach', 'subject', 'campaign', 'note')),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_embedding 
ON public.ai_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_user_id ON public.ai_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_lead_id ON public.ai_embeddings(lead_id);

-- RLS policies
ALTER TABLE public.ai_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
  ON public.ai_embeddings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create embeddings"
  ON public.ai_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings"
  ON public.ai_embeddings FOR DELETE USING (auth.uid() = user_id);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.id,
    ae.content,
    ae.content_type,
    1 - (ae.embedding <=> query_embedding) AS similarity
  FROM public.ai_embeddings ae
  WHERE ae.user_id = p_user_id
    AND 1 - (ae.embedding <=> query_embedding) > match_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
