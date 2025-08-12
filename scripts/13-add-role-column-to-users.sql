-- Add role column to users table and migrate data from user_profiles
-- This fixes the "Could not find the 'role' column of 'users'" error

-- Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;

-- Migrate role data from user_profiles to users table
UPDATE public.users 
SET role = COALESCE(
    (SELECT role FROM public.user_profiles WHERE user_profiles.user_id = users.id),
    'user'
)
WHERE role IS NULL OR role = 'user';

-- Verify the migration
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'author' THEN 1 END) as author_users,
    COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM public.users;

-- Show sample data
SELECT id, name, email, role, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
