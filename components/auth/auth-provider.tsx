"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        setUser(session?.user ?? null)

        // Create user profile if user exists but profile doesn't
        if (session?.user) {
          await createUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setUser(session?.user ?? null)
      setLoading(false)

      // Handle different auth events
      if (event === "SIGNED_IN") {
        // Create or update user profile
        if (session?.user) {
          await createUserProfile(session.user)
        }

        // Redirect to admin if not already there
        if (pathname === "/auth") {
          router.push("/admin")
          router.refresh()
        }
      }

      if (event === "SIGNED_OUT") {
        // Only redirect if currently on admin pages
        if (pathname?.startsWith("/admin")) {
          router.push("/auth")
          router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router, pathname])

  const createUserProfile = async (user: User) => {
    try {
      // First check if user profile already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        console.error("Error checking existing user:", fetchError)
        return
      }

      // If user already exists, just update
      if (existingUser) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            email: user.email,
            name: user.user_metadata?.name || user.email?.split("@")[0],
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("Error updating user profile:", updateError)
        }
      } else {
        // Create new user profile
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user profile:", insertError)

          // If it's a policy violation, it might be because the user was created
          // but the session isn't fully established yet. Let's retry once.
          if (insertError.code === "42501") {
            setTimeout(async () => {
              const { error: retryError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email?.split("@")[0],
                avatar_url: user.user_metadata?.avatar_url,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

              if (retryError) {
                console.error("Error creating user profile (retry):", retryError)
              }
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
    } catch (error) {
      console.error("Error in signOut:", error)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
