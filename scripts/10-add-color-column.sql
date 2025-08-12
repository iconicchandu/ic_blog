-- Add color column to categories table
-- This script adds the missing color column that the categories page expects

-- Add color column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- Update existing categories to have a default color if they don't have one
UPDATE public.categories 
SET color = '#3B82F6' 
WHERE color IS NULL;

-- Add a check constraint to ensure color is a valid hex color
ALTER TABLE public.categories 
ADD CONSTRAINT categories_color_format 
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Update some existing categories with different colors for variety
UPDATE public.categories SET color = '#8B5CF6' WHERE slug = 'technology';
UPDATE public.categories SET color = '#10B981' WHERE slug = 'design';
UPDATE public.categories SET color = '#F59E0B' WHERE slug = 'news';
UPDATE public.categories SET color = '#EF4444' WHERE slug = 'tutorials';
UPDATE public.categories SET color = '#EC4899' WHERE slug = 'reviews';

-- Create an index on color for potential future queries
CREATE INDEX IF NOT EXISTS idx_categories_color ON public.categories(color);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
