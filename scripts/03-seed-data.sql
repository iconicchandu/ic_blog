-- Insert sample blog posts (run after authentication is set up)
INSERT INTO public.posts (title, slug, content, excerpt, published, cover_image) VALUES
(
  'Welcome to Our Blog',
  'welcome-to-our-blog',
  '<h2>Welcome to our amazing blog!</h2><p>This is our first blog post. We''re excited to share our thoughts and ideas with you.</p><p>Stay tuned for more amazing content coming your way!</p>',
  'Welcome to our amazing blog! This is our first blog post where we introduce ourselves and share our vision.',
  true,
  '/placeholder.svg?height=400&width=800'
),
(
  'Getting Started with Next.js 14',
  'getting-started-with-nextjs-14',
  '<h2>Next.js 14 is here!</h2><p>Next.js 14 brings exciting new features including:</p><ul><li>Improved App Router</li><li>Server Actions</li><li>Enhanced performance</li></ul><p>Let''s explore these features together.</p>',
  'Discover the amazing new features in Next.js 14 and how they can improve your development experience.',
  true,
  '/placeholder.svg?height=400&width=800'
),
(
  'Building Modern UIs with Tailwind CSS',
  'building-modern-uis-with-tailwind-css',
  '<h2>Tailwind CSS for Modern Design</h2><p>Tailwind CSS has revolutionized how we build user interfaces. Here''s why:</p><ul><li>Utility-first approach</li><li>Responsive design made easy</li><li>Consistent design system</li></ul>',
  'Learn how Tailwind CSS can help you build beautiful, responsive user interfaces faster than ever.',
  true,
  '/placeholder.svg?height=400&width=800'
);
