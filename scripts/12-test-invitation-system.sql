-- Test script to check invitation system
-- Run this in Supabase SQL Editor to debug invitation issues

-- 1. Check if invitations table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invitations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check all existing invitations
SELECT 
    id,
    email,
    role,
    token,
    expires_at,
    accepted_at,
    created_at,
    invited_by
FROM public.invitations
ORDER BY created_at DESC;

-- 3. Check for any expired invitations
SELECT 
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN accepted_at IS NULL THEN 1 END) as pending_invitations,
    COUNT(CASE WHEN accepted_at IS NOT NULL THEN 1 END) as accepted_invitations,
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_invitations
FROM public.invitations;

-- 4. Create a test invitation (replace with your user ID)
-- First, get your user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Then create a test invitation (replace 'your-user-id-here' with actual ID from above)
-- INSERT INTO public.invitations (
--     email,
--     role,
--     token,
--     expires_at,
--     invited_by,
--     created_at
-- ) VALUES (
--     'test@example.com',
--     'user',
--     gen_random_uuid()::text,
--     NOW() + INTERVAL '7 days',
--     'your-user-id-here',
--     NOW()
-- );

-- 5. Test token lookup (replace 'test-token' with actual token)
-- SELECT * FROM public.invitations 
-- WHERE token = 'test-token'
-- AND accepted_at IS NULL 
-- AND expires_at > NOW();
