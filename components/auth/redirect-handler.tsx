"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function RedirectHandler() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("User is authenticated, redirecting to admin...")
        window.location.href = "/admin"
      }
    }

    // Check immediately
    checkAuthAndRedirect()

    // Also listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        console.log("Sign in detected, redirecting...")
        window.location.href = "/admin"
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return null
}
