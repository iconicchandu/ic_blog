-- Complete database setup with all tables and relationships
-- Run this script to fix all database issues

-- Create categories table first
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES public.users(id)
);

-- Add category_id column if it doesn't exist (handles existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'posts' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create settings table for site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table for user invites
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;

-- Create policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for users
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can view all posts" ON public.posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert posts" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create policies for site settings
CREATE POLICY "Anyone can view settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for invitations
CREATE POLICY "Authenticated users can view invitations" ON public.invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage invitations" ON public.invitations
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories FIRST
INSERT INTO public.categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech trends and innovations', '#3B82F6'),
('Design', 'design', 'UI/UX design and creative inspiration', '#8B5CF6'),
('Development', 'development', 'Programming tutorials and best practices', '#10B981'),
('Tutorials', 'tutorials', 'Step-by-step guides and how-tos', '#F59E0B'),
('News', 'news', 'Industry news and updates', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'BlogSpace'),
('site_description', 'A modern blog platform built with Next.js and Supabase'),
('site_url', 'https://yourblog.com'),
('contact_email', 'contact@yourblog.com'),
('primary_color', '#3B82F6'),
('font_family', 'Inter'),
('comments_enabled', 'true'),
('registration_enabled', 'true'),
('newsletter_enabled', 'false'),
('analytics_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Improved posts insertion with better error handling
DO $$
DECLARE
    tech_id UUID;
    dev_id UUID;
    design_id UUID;
    news_id UUID;
    category_exists BOOLEAN;
BEGIN
    -- Check if categories exist
    SELECT EXISTS(SELECT 1 FROM public.categories LIMIT 1) INTO category_exists;
    
    IF category_exists THEN
        -- Get category IDs safely
        SELECT id INTO tech_id FROM public.categories WHERE slug = 'technology' LIMIT 1;
        SELECT id INTO dev_id FROM public.categories WHERE slug = 'development' LIMIT 1;
        SELECT id INTO design_id FROM public.categories WHERE slug = 'design' LIMIT 1;
        SELECT id INTO news_id FROM public.categories WHERE slug = 'news' LIMIT 1;
        
        -- Only insert posts if we have valid category IDs
        IF news_id IS NOT NULL AND dev_id IS NOT NULL AND design_id IS NOT NULL THEN
            INSERT INTO public.posts (title, slug, content, excerpt, published, cover_image, category_id) VALUES
            (
              'Welcome to Our Blog',
              'welcome-to-our-blog',
              '<h2>Welcome to our amazing blog!</h2><p>This is our first blog post. We''re excited to share our thoughts and ideas with you.</p><p>Stay tuned for more amazing content coming your way!</p>',
              'Welcome to our amazing blog! This is our first blog post where we introduce ourselves and share our vision.',
              true,
              '/placeholder.svg?height=400&width=800',
              news_id
            ),
            (
              'Getting Started with Next.js 14',
              'getting-started-with-nextjs-14',
              '<h2>Next.js 14 is here!</h2><p>Next.js 14 brings exciting new features including:</p><ul><li>Improved App Router</li><li>Server Actions</li><li>Enhanced performance</li></ul><p>Let''s explore these features together.</p>',
              'Discover the amazing new features in Next.js 14 and how they can improve your development experience.',
              true,
              '/placeholder.svg?height=400&width=800',
              dev_id
            ),
            (
              'Building Modern UIs with Tailwind CSS',
              'building-modern-uis-with-tailwind-css',
              '<h2>Tailwind CSS for Modern Design</h2><p>Tailwind CSS has revolutionized how we build user interfaces. Here''s why:</p><ul><li>Utility-first approach</li><li>Responsive design made easy</li><li>Consistent design system</li></ul>',
              'Learn how Tailwind CSS can help you build beautiful, responsive user interfaces faster than ever.',
              true,
              '/placeholder.svg?height=400&width=800',
              design_id
            )
            ON CONFLICT (slug) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.posts TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.invitations TO anon, authenticated;
