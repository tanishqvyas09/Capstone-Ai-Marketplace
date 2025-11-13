-- ============================================
-- RESET TOKENS FOR TESTING
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Option 1: Reset tokens for a specific user (by email)
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET tokens_remaining = 5000
WHERE email = 'your-email@example.com';

-- Option 2: Reset tokens for a specific user (by user ID)
-- Replace 'your-user-id-here' with your actual user ID
UPDATE public.profiles
SET tokens_remaining = 5000
WHERE id = 'your-user-id-here';

-- Option 3: Reset tokens for ALL users (use with caution!)
UPDATE public.profiles
SET tokens_remaining = 5000;

-- Option 4: Reset tokens for the currently logged-in user
-- This works if you run it while logged into Supabase
UPDATE public.profiles
SET tokens_remaining = 5000
WHERE id = auth.uid();

-- ============================================
-- VERIFY TOKEN RESET
-- ============================================

-- Check tokens for a specific user by email
SELECT id, email, full_name, tokens_remaining
FROM public.profiles
WHERE email = 'your-email@example.com';

-- Check tokens for ALL users
SELECT id, email, full_name, tokens_remaining
FROM public.profiles
ORDER BY tokens_remaining DESC;

-- ============================================
-- CLEAR TOKEN USAGE LOGS (OPTIONAL)
-- Use this to clear history for testing
-- ============================================

-- Clear token_usage_log for a specific user
DELETE FROM public.token_usage_log
WHERE user_id = 'your-user-id-here';

-- Clear usage_logs for a specific user
DELETE FROM public.usage_logs
WHERE user_id = 'your-user-id-here';

-- Clear ALL token usage logs (use with caution!)
-- DELETE FROM public.token_usage_log;
-- DELETE FROM public.usage_logs;

-- ============================================
-- QUICK RESET SCRIPT
-- Copy and run this for fastest reset
-- ============================================

-- Reset to 5000 tokens for currently logged-in user and clear logs
BEGIN;
  UPDATE public.profiles SET tokens_remaining = 5000 WHERE id = auth.uid();
  DELETE FROM public.token_usage_log WHERE user_id = auth.uid();
  DELETE FROM public.usage_logs WHERE user_id = auth.uid();
COMMIT;

-- Verify
SELECT email, tokens_remaining FROM public.profiles WHERE id = auth.uid();
