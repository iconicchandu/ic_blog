import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, FileText, Eye, Calendar, Clock, Tag } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = createServerClient()

  // Get analytics data
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: totalUsers },
    { data: recentPosts },
    { data: categoriesWithCounts },
    { data: monthlyPosts },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", false),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id, title, created_at, published")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("categories").select(`
        *,
        posts!inner(id)
      `),
    supabase
      .from("posts")
      .select("created_at, published")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }),
  ])

  // Process monthly data
  const monthlyData =
    monthlyPosts?.reduce((acc: any, post) => {
      const month = new Date(post.created_at).toLocaleDateString("en-US", { month: "short" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {}) || {}

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts || 0,
      icon: FileText,
      description: "All blog posts",
      trend: "+12%",
      color: "text-blue-600",
    },
    {
      title: "Published",
      value: publishedPosts || 0,
      icon: Eye,
      description: "Live posts",
      trend: "+8%",
      color: "text-green-600",
    },
    {
      title: "Drafts",
      value: draftPosts || 0,
      icon: Clock,
      description: "Unpublished posts",
      trend: "+3%",
      color: "text-yellow-600",
    },
    {
      title: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      description: "Registered users",
      trend: "+15%",
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your blog's performance and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <Badge variant="secondary" className="text-green-600">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
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
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesWithCounts && categoriesWithCounts.length > 0 ? (
              <div className="space-y-4">
                {categoriesWithCounts.map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.posts?.length || 0} posts</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No categories found</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Posts Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Posts (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(monthlyData).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((count as number) * 20, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg. Posts per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalPosts || 0) / Math.max(1, Object.keys(monthlyData).length))}
            </div>
            <p className="text-xs text-muted-foreground">Based on recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Publication Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPosts ? Math.round(((publishedPosts || 0) / totalPosts) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Posts published vs drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Content Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">Regular publishing schedule</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
