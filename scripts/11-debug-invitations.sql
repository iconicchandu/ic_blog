-- Debug script to check invitations table
SELECT 
  id,
  email,
  role,
  token,
  created_at,
  expires_at,
  accepted_at,
  invited_by
FROM public.invitations
ORDER BY created_at DESC;

-- Check if there are any invitations at all
SELECT COUNT(*) as total_invitations FROM public.invitations;

-- Check expired vs valid invitations
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as valid,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired,
  COUNT(CASE WHEN accepted_at IS NOT NULL THEN 1 END) as accepted
FROM public.invitations;
