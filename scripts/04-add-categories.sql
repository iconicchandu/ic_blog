-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'category_id') THEN
    ALTER TABLE public.posts ADD COLUMN category_id UUID;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'posts_category_id_fkey') THEN
    ALTER TABLE public.posts 
    ADD CONSTRAINT posts_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech trends and innovations', '#3B82F6'),
('Design', 'design', 'UI/UX design and creative inspiration', '#8B5CF6'),
('Development', 'development', 'Programming tutorials and best practices', '#10B981'),
('Tutorials', 'tutorials', 'Step-by-step guides and how-tos', '#F59E0B'),
('News', 'news', 'Industry news and updates', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Update existing posts with random categories (optional)
UPDATE public.posts 
SET category_id = (
  SELECT id FROM public.categories 
  ORDER BY RANDOM() 
  LIMIT 1
) 
WHERE category_id IS NULL;
