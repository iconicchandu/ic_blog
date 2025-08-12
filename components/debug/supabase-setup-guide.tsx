"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, AlertTriangle, Database } from "lucide-react"
import { useState } from "react"

export function SupabaseSetupGuide() {
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(""), 2000)
  }

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wfvnkdwrbturnejyffqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmdm5rZHdyYnR1cm5lanlmZnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTkwMTgsImV4cCI6MjA3MDEzNTAxOH0.YOUR_ACTUAL_ANON_KEY_SIGNATURE_HERE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmdm5rZHdyYnR1cm5lanlmZnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1OTAxOCwiZXhwIjoyMDcwMTM1MDE4fQ.doBqzq4EAJQQGF4t0P1oLv8B9TUAPFVIY7TsERsJw_4`

  const createTablesSQL = `-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for posts table
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can view all posts" ON public.posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert posts" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Insert sample data
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
);`

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Supabase Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Your Supabase connection needs to be configured. Follow these steps to fix the issue.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              1
            </span>
            Get your API keys
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-6">
            <li>
              Go to your{" "}
              <a
                href="https://supabase.com/dashboard/project/wfvnkdwrbturnejyffqr/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Supabase Dashboard API Settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Copy the <strong>"anon public"</strong> key (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
            </li>
            <li>
              Copy the <strong>"service_role"</strong> key (also starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              2
            </span>
            Update your .env.local file
          </h4>
          <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {envTemplate}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-transparent"
              onClick={() => copyToClipboard(envTemplate, "env")}
            >
              {copied === "env" ? "Copied!" : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Important:</strong> Replace "YOUR_ACTUAL_ANON_KEY_SIGNATURE_HERE" with the actual signature part
              from your anon key.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              3
            </span>
            Create database tables
          </h4>
          <p className="text-sm text-muted-foreground ml-6">
            Go to your{" "}
            <a
              href="https://supabase.com/dashboard/project/wfvnkdwrbturnejyffqr/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Supabase SQL Editor
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            and run this SQL:
          </p>
          <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto max-h-40">
              {createTablesSQL}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-transparent"
              onClick={() => copyToClipboard(createTablesSQL, "sql")}
            >
              {copied === "sql" ? "Copied!" : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              4
            </span>
            Restart your development server
          </h4>
          <div className="relative ml-6">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">npm run dev</pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-transparent"
              onClick={() => copyToClipboard("npm run dev", "cmd")}
            >
              {copied === "cmd" ? "Copied!" : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Make sure your Supabase project is not paused. Free tier projects pause after 1 week
            of inactivity.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
