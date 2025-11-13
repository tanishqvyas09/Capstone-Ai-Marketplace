-- ============================================
-- ADD SOCIALINSIGHT AGENT TO DATABASE
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Insert SocialInsight agent with 150 token cost
INSERT INTO public.agents (id, name, description, tokens_cost) 
VALUES 
    (13, 'SocialInsight', 'AI-powered YouTube & Instagram content analyzer - Download, transcribe and analyze videos/profiles with engagement metrics', 150)
ON CONFLICT (id) 
DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    tokens_cost = EXCLUDED.tokens_cost;

-- Update the sequence to continue from 13
SELECT setval('agents_id_seq', 13, true);

-- Verify the insertion
SELECT * FROM public.agents WHERE name = 'SocialInsight';
