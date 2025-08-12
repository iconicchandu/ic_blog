"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { UserPlus, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function InvitePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingInvite, setIsCheckingInvite] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const supabase = createClient()

  useEffect(() => {
    if (token) {
      loadInvitation()
    } else {
      setIsCheckingInvite(false)
      setError("No invitation token provided")
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      setError("")

      console.log("Loading invitation with token:", token)

      const { data: anyInvitation, error: anyError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single()

      console.log("Any invitation check:", { anyInvitation, anyError })

      if (anyError && anyError.code === "PGRST116") {
        console.log("No invitation found with token:", token)
        setError("Invalid invitation token")
        return
      }

      if (anyInvitation) {
        console.log("Found invitation:", anyInvitation)

        // Check if already accepted
        if (anyInvitation.accepted_at) {
          console.log("Invitation already accepted at:", anyInvitation.accepted_at)
          setError("This invitation has already been used")
          return
        }

        // Check if expired
        const expiresAt = new Date(anyInvitation.expires_at)
        const now = new Date()
        console.log("Expiry check:", { expiresAt, now, expired: expiresAt <= now })

        if (expiresAt <= now) {
          setError("This invitation has expired")
          return
        }

        // Invitation is valid
        setInvitation(anyInvitation)
      } else {
        setError("Invalid invitation token")
      }
    } catch (error: any) {
      console.error("Error loading invitation:", error)
      setError("Failed to load invitation")
    } finally {
      setIsCheckingInvite(false)
    }
  }

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invitation) return

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            name: name.trim(),
            role: invitation.role,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("An account with this email already exists")
        } else {
          setError(authError.message)
        }
        return
      }

      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id)

      if (updateError) {
        console.error("Error updating invitation:", updateError)
        // Don't fail the whole process if this fails
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      })

      // Redirect to login page
      setTimeout(() => {
        router.push("/auth?message=Account created successfully. Please sign in.")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating account:", error)
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Accept Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join as a <strong>{invitation?.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={invitation?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/auth")}>
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
