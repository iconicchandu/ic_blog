import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Eye, Users, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Get stats
  const [{ count: totalPosts }, { count: publishedPosts }, { count: draftPosts }] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", false),
  ])

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, title, created_at, published")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts || 0,
      icon: FileText,
      description: "All blog posts",
    },
    {
      title: "Published",
      value: publishedPosts || 0,
      icon: Eye,
      description: "Live posts",
    },
    {
      title: "Drafts",
      value: draftPosts || 0,
      icon: Users,
      description: "Unpublished posts",
    },
    {
      title: "Views",
      value: "1.2K",
      icon: TrendingUp,
      description: "Total page views",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your blog admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No posts yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/admin/posts/new" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Create New Post</div>
                <div className="text-sm text-muted-foreground">Start writing a new blog post</div>
              </a>
              <a href="/admin/posts" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Manage Posts</div>
                <div className="text-sm text-muted-foreground">Edit or delete existing posts</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
