"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function BlogHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Welcome to Our Blog
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
          Discover insights, tutorials, and stories from our team. Stay updated with the latest in technology and
          design.
        </p>
        <Button
          size="lg"
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          onClick={() => {
            document.getElementById("blog-posts")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          Explore Posts
          <ArrowDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </section>
  )
}
