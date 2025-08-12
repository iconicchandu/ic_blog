"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { generateSlug, extractExcerpt } from "@/lib/utils/slug"
import { Save, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Category } from "@/lib/supabase/types"

interface PostEditorProps {
  postId?: string
}

export function PostEditor({ postId }: PostEditorProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCategories()
    if (postId) {
      loadPost()
    }
  }, [postId])

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name")

    setCategories(data || [])
  }

  const loadPost = async () => {
    if (!postId) return

    const { data: post, error } = await supabase.from("posts").select("*").eq("id", postId).single()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      })
      return
    }

    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setContent(post.content || "")
      setExcerpt(post.excerpt || "")
      setCoverImage(post.cover_image || "")
      setPublished(post.published)
      setCategoryId(post.category_id || "")
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!postId) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("blog-images").upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName)

      setCoverImage(data.publicUrl)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (shouldPublish = false) => {
    if (!user || !title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || extractExcerpt(content),
        cover_image: coverImage,
        published: shouldPublish,
        category_id: categoryId || null,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (postId) {
        const { error } = await supabase.from("posts").update(postData).eq("id", postId)

        if (error) throw error

        toast({
          title: "Success",
          description: `Post ${shouldPublish ? "published" : "saved"} successfully`,
        })
      } else {
        const { error } = await supabase.from("posts").insert({
          ...postData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Success",
          description: `Post ${shouldPublish ? "published" : "created"} successfully`,
        })

        router.push("/admin/posts")
      }

      if (shouldPublish) {
        setPublished(true)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{postId ? "Edit Post" : "Create New Post"}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            {published ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... (HTML supported)"
                  rows={20}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverImage && (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={coverImage || "/placeholder.svg"} alt="Cover image" fill className="object-cover" />
                </div>
              )}

              <div>
                <Label htmlFor="cover-image">Upload Image</Label>
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {isUploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              </div>

              <div>
                <Label htmlFor="cover-image-url">Or enter URL</Label>
                <Input
                  id="cover-image-url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
