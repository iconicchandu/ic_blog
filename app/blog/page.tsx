import { createServerClient } from "@/lib/supabase/server"
import { BlogCard } from "@/components/blog/blog-card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

interface BlogPageProps {
  searchParams: {
    category?: string
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const supabase = createServerClient()

  // Get categories for filter
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Build query based on category filter
  let posts = null
  let selectedCategory = null

  try {
    if (searchParams.category) {
      const { data: category } = await supabase
        .from("categories")
        .select("id, name, description, slug")
        .eq("slug", searchParams.category)
        .single()

      selectedCategory = category
    }

    // Try the relationship query first
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
      .eq(selectedCategory ? "category_id" : "published", selectedCategory ? selectedCategory.id : true)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("Relationship query failed, trying simpler approach:", error)

      // Fallback to simpler query
      const { data: simplePosts } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .eq(selectedCategory ? "category_id" : "published", selectedCategory ? selectedCategory.id : true)
        .order("created_at", { ascending: false })

      posts =
        simplePosts?.map((post) => ({
          ...post,
          users: null,
          categories: null,
        })) || []
    } else {
      posts = data
    }
  } catch (error) {
    console.error("Error loading posts:", error)
    posts = []
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {selectedCategory ? `${selectedCategory.name} Posts` : "All Blog Posts"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {selectedCategory
              ? selectedCategory.description || `Explore all posts in ${selectedCategory.name}`
              : "Explore all our articles, tutorials, and insights."}
          </p>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            <a href="/blog">
              <Badge
                variant={!searchParams.category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90"
              >
                <Tag className="h-3 w-3 mr-1" />
                All Posts
              </Badge>
            </a>
            {categories.map((category) => (
              <a key={category.id} href={`/blog?category=${category.slug}`}>
                <Badge
                  variant={searchParams.category === category.slug ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90"
                  style={
                    searchParams.category === category.slug
                      ? {
                          backgroundColor: category.color,
                          borderColor: category.color,
                        }
                      : {}
                  }
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {category.name}
                </Badge>
              </a>
            ))}
          </div>
        )}

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {selectedCategory ? `No posts found in ${selectedCategory.name} category.` : "No posts available yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
