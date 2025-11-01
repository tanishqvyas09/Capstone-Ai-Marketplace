-- ============================================
-- SUPABASE TOKEN DEDUCTION SYSTEM SETUP
-- ============================================

-- Step 1: Ensure agents table has the correct structure
-- First, check if table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Create table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.agents (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add tokens_cost column if it doesn't exist (handles both cost and tokens_cost naming)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agents' AND column_name='tokens_cost') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='agents' AND column_name='cost') THEN
            ALTER TABLE public.agents RENAME COLUMN cost TO tokens_cost;
        ELSE
            ALTER TABLE public.agents ADD COLUMN tokens_cost INTEGER NOT NULL DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Step 2: Ensure profiles table has the correct structure
-- Run this if the table doesn't exist or needs updating
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    tokens_remaining INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create token usage log table to track all transactions
CREATE TABLE IF NOT EXISTS public.token_usage_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id BIGINT REFERENCES public.agents(id),
    agent_name TEXT NOT NULL,
    tokens_deducted INTEGER NOT NULL,
    tokens_before INTEGER NOT NULL,
    tokens_after INTEGER NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    request_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_usage_log_user_id ON public.token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_agent_id ON public.token_usage_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_log_created_at ON public.token_usage_log(created_at);

-- Step 5: Insert agent data with token costs
-- NOTE: WhatsPulse has a base cost of 50 tokens PER CONTACT (will be multiplied by contact count in frontend)
-- NOTE: TrendIQ has a base cost of 1 token (will be multiplied by 150 for location mode or 250 for keyword mode in frontend)
INSERT INTO public.agents (name, description, tokens_cost) 
VALUES 
    ('SEOrix', 'AI agent for search engine optimization', 200),
    ('LeadGen', 'Intelligent lead generation and contact discovery', 150),
    ('WhatsPulse', 'Automates WhatsApp marketing campaigns - 50 tokens per contact', 50),
    ('AdVisor', 'Creates optimized ad titles and visuals', 200),
    ('SociaPlan', 'Social Media Calendar Generator - Full week content planning', 250),
    ('EchoMind', 'Analyzes customer recordings for sentiment patterns', 150),
    ('TrendIQ', 'Scans news, social media, and on-chain data - 150 tokens (location) or 250 tokens (keyword)', 1)
ON CONFLICT (name) 
DO UPDATE SET 
    description = EXCLUDED.description,
    tokens_cost = EXCLUDED.tokens_cost;

-- Step 6: Create function to check if user has sufficient tokens
-- Now supports token_multiplier for agents like WhatsPulse (50 tokens per contact)
CREATE OR REPLACE FUNCTION public.check_user_tokens(
    p_user_id UUID,
    p_agent_name TEXT,
    p_token_multiplier INTEGER DEFAULT 1
)
RETURNS TABLE (
    has_tokens BOOLEAN,
    current_tokens INTEGER,
    required_tokens INTEGER,
    message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_tokens INTEGER;
    v_base_cost INTEGER;
    v_required_tokens INTEGER;
BEGIN
    -- Get user's current token balance
    SELECT tokens_remaining INTO v_current_tokens
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Get agent's base token cost
    SELECT tokens_cost INTO v_base_cost
    FROM public.agents
    WHERE name = p_agent_name;
    
    -- Calculate required tokens (base cost × multiplier)
    v_required_tokens := v_base_cost * p_token_multiplier;
    
    -- Check if user exists
    IF v_current_tokens IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, COALESCE(v_required_tokens, 0), 'User profile not found';
        RETURN;
    END IF;
    
    -- Check if agent exists
    IF v_base_cost IS NULL THEN
        RETURN QUERY SELECT FALSE, v_current_tokens, 0, 'Agent not found';
        RETURN;
    END IF;
    
    -- Check if user has sufficient tokens
    IF v_current_tokens >= v_required_tokens THEN
        RETURN QUERY SELECT TRUE, v_current_tokens, v_required_tokens, 'Sufficient tokens';
    ELSE
        RETURN QUERY SELECT FALSE, v_current_tokens, v_required_tokens, 'Insufficient tokens';
    END IF;
END;
$$;

-- Step 7: Create function to deduct tokens after successful operation
-- Now supports token_multiplier for agents like WhatsPulse (50 tokens per contact)
CREATE OR REPLACE FUNCTION public.deduct_tokens(
    p_user_id UUID,
    p_agent_name TEXT,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL,
    p_request_data JSONB DEFAULT NULL,
    p_token_multiplier INTEGER DEFAULT 1
)
RETURNS TABLE (
    success BOOLEAN,
    tokens_deducted INTEGER,
    tokens_remaining INTEGER,
    message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agent_id BIGINT;
    v_base_cost INTEGER;
    v_tokens_cost INTEGER;
    v_tokens_before INTEGER;
    v_tokens_after INTEGER;
BEGIN
    -- Get agent details
    SELECT id, tokens_cost INTO v_agent_id, v_base_cost
    FROM public.agents
    WHERE name = p_agent_name;
    
    -- Calculate total cost (base cost × multiplier)
    v_tokens_cost := v_base_cost * p_token_multiplier;
    
    -- Check if agent exists
    IF v_agent_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'Agent not found';
        RETURN;
    END IF;
    
    -- Get current token balance
    SELECT tokens_remaining INTO v_tokens_before
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF v_tokens_before IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'User profile not found';
        RETURN;
    END IF;
    
    -- Only deduct tokens if operation was successful
    IF p_success THEN
        -- Check if user has sufficient tokens
        IF v_tokens_before < v_tokens_cost THEN
            RETURN QUERY SELECT FALSE, 0, v_tokens_before, 'Insufficient tokens';
            RETURN;
        END IF;
        
        -- Deduct tokens
        UPDATE public.profiles
        SET tokens_remaining = profiles.tokens_remaining - v_tokens_cost
        WHERE id = p_user_id
        RETURNING profiles.tokens_remaining INTO v_tokens_after;
        
        -- Log the transaction
        INSERT INTO public.token_usage_log (
            user_id, 
            agent_id, 
            agent_name, 
            tokens_deducted, 
            tokens_before, 
            tokens_after, 
            success,
            error_message,
            request_data
        ) VALUES (
            p_user_id,
            v_agent_id,
            p_agent_name,
            v_tokens_cost,
            v_tokens_before,
            v_tokens_after,
            TRUE,
            NULL,
            p_request_data
        );
        
        RETURN QUERY SELECT TRUE, v_tokens_cost, v_tokens_after, 'Tokens deducted successfully';
    ELSE
        -- Log failed attempt (no tokens deducted)
        INSERT INTO public.token_usage_log (
            user_id, 
            agent_id, 
            agent_name, 
            tokens_deducted, 
            tokens_before, 
            tokens_after, 
            success,
            error_message,
            request_data
        ) VALUES (
            p_user_id,
            v_agent_id,
            p_agent_name,
            0,
            v_tokens_before,
            v_tokens_before,
            FALSE,
            p_error_message,
            p_request_data
        );
        
        RETURN QUERY SELECT FALSE, 0, v_tokens_before, 'Operation failed - no tokens deducted';
    END IF;
END;
$$;

-- Step 8: Create function to get user's token usage history
CREATE OR REPLACE FUNCTION public.get_token_usage_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id BIGINT,
    agent_name TEXT,
    tokens_deducted INTEGER,
    tokens_before INTEGER,
    tokens_after INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tul.id,
        tul.agent_name,
        tul.tokens_deducted,
        tul.tokens_before,
        tul.tokens_after,
        tul.success,
        tul.error_message,
        tul.created_at
    FROM public.token_usage_log tul
    WHERE tul.user_id = p_user_id
    ORDER BY tul.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage_log ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS Policies

-- Agents table - everyone can read
CREATE POLICY "Anyone can view agents" ON public.agents
    FOR SELECT USING (true);

-- Profiles table - users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Token usage log - users can only see their own logs
CREATE POLICY "Users can view own token usage" ON public.token_usage_log
    FOR SELECT USING (auth.uid() = user_id);

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.agents TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.token_usage_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_token_usage_history TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Now you can use these functions in your frontend:
-- 1. check_user_tokens(user_id, agent_name) - Check before making API call
-- 2. deduct_tokens(user_id, agent_name, success, error_msg, request_data) - Deduct after successful response
-- 3. get_token_usage_history(user_id, limit) - View transaction history
-- ============================================
