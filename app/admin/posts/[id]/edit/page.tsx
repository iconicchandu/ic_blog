import { PostEditor } from "@/components/admin/post-editor"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return <PostEditor postId={params.id} />
}
