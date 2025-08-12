import { createServerClient } from "@/lib/supabase/server"
import { BlogHero } from "@/components/blog/blog-hero"
import { BlogCard } from "@/components/blog/blog-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Plus, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  let posts = null
  let hasError = false
  let errorMessage = ""
  let isApiKeyError = false

  try {
    const supabase = createServerClient()

    // First, let's try a simpler query to test the connection
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        cover_image,
        published,
        created_at,
        updated_at,
        author_id,
        category_id,
        users!posts_author_id_fkey (
          name,
          avatar_url
        ),
        categories!posts_category_id_fkey (
          id,
          name,
          slug,
          color
        )
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      // If the relationship query fails, try without relationships
      console.log("Relationship query failed, trying simpler query:", error)

      const { data: simplePosts, error: simpleError } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6)

      if (simpleError) {
        hasError = true
        errorMessage = simpleError.message
        isApiKeyError = simpleError.message.includes("Invalid API key") || simpleError.message.includes("JWT")
        console.error("Database error:", simpleError)
      } else {
        // Transform simple posts to match expected format
        posts =
          simplePosts?.map((post) => ({
            ...post,
            users: null,
            categories: null,
          })) || []
      }
    } else {
      posts = data
    }
  } catch (err: any) {
    hasError = true
    errorMessage = err.message
    isApiKeyError = err.message.includes("Invalid API key") || err.message.includes("JWT")
    console.error("Connection error:", err)
  }

  return (
    <div className="min-h-screen">
      <BlogHero />

      <section id="blog-posts" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Posts</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our latest articles, tutorials, and insights on technology, design, and development.
            </p>
          </div>

          {hasError ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {isApiKeyError ? "API Configuration Required" : "Database Setup Required"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isApiKeyError ? (
                  <>
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        <strong>Invalid API Key:</strong> Your Supabase API key is not valid or missing.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Quick Fix:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>
                          Go to your{" "}
                          <a
                            href="https://supabase.com/dashboard/project/ajdlssekwzxerxolxhfx/settings/api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            Supabase API Settings
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>Copy the "anon public" key (the long JWT token)</li>
                        <li>
                          Update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with:
                          <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                            NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
                          </pre>
                        </li>
                        <li>
                          Restart your development server with{" "}
                          <code className="bg-gray-100 px-1 rounded">npm run dev</code>
                        </li>
                      </ol>
                    </div>

                    <Link href="/auth">
                      <Button className="w-full">Go to Setup Guide</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Database className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Database Setup Required</h3>
                      <p className="text-muted-foreground">
                        {errorMessage.includes("relation") || errorMessage.includes("does not exist")
                          ? "The database tables haven't been created yet."
                          : errorMessage.includes("relationship")
                            ? "The database relationships need to be set up."
                            : "There's an issue connecting to the database."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Please run the SQL scripts in your Supabase dashboard to create the necessary tables and
                        relationships.
                      </p>
                      <Link href="/auth">
                        <Button className="w-full">Go to Setup Guide</Button>
                      </Link>
                    </div>
                  </>
                )}

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Error details:</strong> {errorMessage}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : posts && posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <div className="text-center">
                <Link href="/blog">
                  <Button size="lg">View All Posts</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No posts available yet.</p>
              <Link href="/admin">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
