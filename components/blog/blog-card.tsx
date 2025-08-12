import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag } from "lucide-react"
import type { Post, Category } from "@/lib/supabase/types"

interface BlogCardProps {
  post: Post & {
    users?: {
      name: string | null
      avatar_url: string | null
    } | null
    categories?: Category | null
  }
}

export function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.cover_image || "/placeholder.svg?height=300&width=500&query=blog post"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {post.categories && (
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-900 hover:bg-white"
              style={{
                backgroundColor: `${post.categories.color}20`,
                color: post.categories.color,
                borderColor: post.categories.color,
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {post.categories.name}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.created_at)}
          </div>
          {post.users?.name && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.users.name}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>

        {post.excerpt && <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>}

        <Badge variant="secondary" className="mb-4">
          Published
        </Badge>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
          Read more →
        </Link>
      </CardFooter>
    </Card>
  )
}
