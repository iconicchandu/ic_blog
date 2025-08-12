"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { UserPlus, Mail, Send, Copy, CheckCircle, AlertTriangle, Info } from "lucide-react"

export function InviteUserDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingTable, setIsCheckingTable] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("user")
  const [message, setMessage] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [showInviteLink, setShowInviteLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [requiresDomainVerification, setRequiresDomainVerification] = useState(false)

  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      checkInvitationsTable()
    }
  }, [isOpen])

  const checkInvitationsTable = async () => {
    setIsCheckingTable(true)
    try {
      // Try a simple query to check if the table exists
      const { error } = await supabase.from("invitations").select("id").limit(1)

      if (
        error &&
        (error.message.includes("relation") ||
          error.message.includes("does not exist") ||
          error.message.includes("schema cache") ||
          error.message.includes("table"))
      ) {
        setTableExists(false)
      } else {
        setTableExists(true)
      }
    } catch (error) {
      console.error("Error checking invitations table:", error)
      setTableExists(false)
    } finally {
      setIsCheckingTable(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setRole("user")
    setMessage("")
    setInviteLink("")
    setShowInviteLink(false)
    setLinkCopied(false)
    setEmailSent(false)
    setRequiresDomainVerification(false)
  }

  const sendInvitationEmail = async (inviteUrl: string) => {
    try {
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          role,
          message,
          inviteUrl,
          inviterName: user?.user_metadata?.full_name || user?.email || "Admin",
          inviterEmail: user?.email || "",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email")
      }

      if (result.requiresDomainVerification) {
        setRequiresDomainVerification(true)
        toast({
          title: "Domain verification required",
          description: "Invitation created! Share the link manually as email sending requires domain verification.",
          variant: "default",
        })
      } else {
        setEmailSent(true)
        toast({
          title: "Email sent!",
          description: `Invitation email has been sent to ${email}`,
        })
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setRequiresDomainVerification(true)
      toast({
        title: "Email not sent",
        description: "Invitation was created but email could not be sent. You can share the link manually.",
        variant: "default",
      })
    }
  }

  const handleInvite = async () => {
    if (!tableExists) {
      toast({
        title: "Feature Unavailable",
        description: "The invitations table doesn't exist. Please run the database setup script.",
        variant: "destructive",
      })
      return
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("email").eq("email", email.trim()).single()

      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this email already exists",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { data: existingInvite } = await supabase
        .from("invitations")
        .select("id")
        .eq("email", email.trim())
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (existingInvite) {
        toast({
          title: "Error",
          description: "There's already a pending invitation for this email",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Generate invitation token
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

      // Insert invitation
      const { error } = await supabase.from("invitations").insert({
        email: email.trim(),
        role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: user.id,
        created_at: new Date().toISOString(),
      })

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "An invitation for this email already exists",
            variant: "destructive",
          })
        } else {
          throw error
        }
        setIsLoading(false)
        return
      }

      // Generate invitation link
      const inviteUrl = `${window.location.origin}/auth/invite?token=${token}`
      setInviteLink(inviteUrl)
      setShowInviteLink(true)

      await sendInvitationEmail(inviteUrl)

      toast({
        title: "Invitation created!",
        description: "The invitation has been created successfully.",
      })
    } catch (error: any) {
      console.error("Error sending invitation:", error)
      if (
        error.message?.includes("schema cache") ||
        error.message?.includes("table") ||
        error.message?.includes("relation")
      ) {
        toast({
          title: "Database Error",
          description: "The invitations table is not properly set up. Please run the database setup script.",
          variant: "destructive",
        })
        setTableExists(false)
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard",
      })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetForm, 300) // Reset after dialog closes
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>Send an invitation to a new user to join your blog.</DialogDescription>
        </DialogHeader>

        {isCheckingTable ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !tableExists ? (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Database Setup Required</strong>
                <br />
                The invitations table doesn't exist. Please run the database setup script (08-complete-database-fix.sql)
                in your Supabase dashboard to enable user invitations.
              </AlertDescription>
            </Alert>
          </div>
        ) : !showInviteLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - Can read posts</SelectItem>
                  <SelectItem value="author">Author - Can create posts</SelectItem>
                  <SelectItem value="editor">Editor - Can edit all posts</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the invitation..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Invitation created successfully! {emailSent ? `Email sent to ${email}.` : "Share this link with"}{" "}
                <strong>{email}</strong>:
              </AlertDescription>
            </Alert>

            {requiresDomainVerification && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Email sending limited:</strong> To send emails automatically, verify a domain at{" "}
                  <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">
                    resend.com/domains
                  </a>
                  . For now, share the link below manually.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex space-x-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={copyInviteLink}>
                  {linkCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                This invitation link will expire in 7 days. The user will need to create an account using this link.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {!tableExists ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : !showInviteLink ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
