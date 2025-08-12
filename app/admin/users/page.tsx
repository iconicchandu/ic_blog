"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Mail, Calendar, MoreHorizontal, Edit, Trash2, AlertTriangle, Database } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InviteUserDialog } from "@/components/admin/invite-user-dialog"
import { UserManagementDialog } from "@/components/admin/user-management-dialog"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [missingTables, setMissingTables] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogMode, setDialogMode] = useState<"edit" | "delete">("edit")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setHasError(false)
      setErrorMessage("")
      setMissingTables([])

      const missing: string[] = []

      // Try to load users first
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          *,
          posts(id)
        `)
        .order("created_at", { ascending: false })

      if (usersError) {
        if (
          usersError.message.includes("relation") ||
          usersError.message.includes("does not exist") ||
          usersError.message.includes("schema cache")
        ) {
          missing.push("users")
        } else {
          throw usersError
        }
      } else {
        setUsers(usersData || [])
      }

      // Try to load invitations (this is optional, so we handle errors gracefully)
      try {
        const { data: invitationsData, error: invitationsError } = await supabase
          .from("invitations")
          .select("*")
          .is("accepted_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })

        if (invitationsError) {
          if (
            invitationsError.message.includes("relation") ||
            invitationsError.message.includes("does not exist") ||
            invitationsError.message.includes("schema cache")
          ) {
            missing.push("invitations")
          } else {
            console.warn("Error loading invitations:", invitationsError)
          }
        } else {
          setInvitations(invitationsData || [])
        }
      } catch (inviteError) {
        console.warn("Invitations table not available:", inviteError)
        missing.push("invitations")
      }

      // If critical tables are missing, show error
      if (missing.includes("users")) {
        setHasError(true)
        setErrorMessage("Required database tables are missing. Please run the database setup script.")
        setMissingTables(missing)
      } else if (missing.length > 0) {
        setMissingTables(missing)
        // Continue with partial functionality
      }
    } catch (error: any) {
      console.error("Error loading data:", error)
      setHasError(true)
      setErrorMessage(error.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setDialogMode("delete")
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedUser(null)
  }

  const handleUserUpdated = () => {
    loadData()
  }

  const recentUsers = users.filter((user) => {
    const createdAt = new Date(user.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return createdAt > weekAgo
  }).length

  const activeUsers = users.filter((user) => user.posts?.length > 0).length

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      description: "All registered users",
      color: "text-blue-600",
    },
    {
      title: "New This Week",
      value: recentUsers,
      icon: UserPlus,
      description: "Recently joined",
      color: "text-green-600",
    },
    {
      title: "Active Authors",
      value: activeUsers,
      icon: Edit,
      description: "Users with posts",
      color: "text-purple-600",
    },
    {
      title: "Pending Invites",
      value: invitations.length,
      icon: Mail,
      description: "Awaiting response",
      color: "text-orange-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage your blog users and authors</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage your blog users and authors</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Database Setup Required</h3>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                <Alert className="border-red-200 bg-red-50 text-left">
                  <AlertDescription className="text-red-800">
                    <strong>Missing tables:</strong> {missingTables.join(", ")}
                    <br />
                    Please run the database setup script (08-complete-database-fix.sql) in your Supabase dashboard.
                  </AlertDescription>
                </Alert>
              </div>
              <Button onClick={loadData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage your blog users and authors</p>
        </div>
        {missingTables.includes("invitations") ? (
          <Alert className="max-w-sm">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Invitations feature unavailable. Run database setup to enable.
            </AlertDescription>
          </Alert>
        ) : (
          <InviteUserDialog />
        )}
      </div>

      {/* Warning for missing tables */}
      {missingTables.length > 0 && !hasError && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Partial functionality:</strong> Some features are unavailable because these tables are missing:{" "}
            {missingTables.join(", ")}. Run the database setup script to enable all features.
          </AlertDescription>
        </Alert>
      )}

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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Invitations - only show if invitations table exists */}
      {!missingTables.includes("invitations") && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invitation.role} • Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.name || "Unnamed User"}</h3>
                        {user.posts?.length > 0 && <Badge variant="secondary">Author</Badge>}
                        {user.role === "admin" && <Badge variant="default">Admin</Badge>}
                        {user.role === "editor" && <Badge variant="outline">Editor</Badge>}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{user.posts?.length || 0} posts</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by inviting your first user.</p>
              <div className="mt-6">
                {!missingTables.includes("invitations") ? (
                  <InviteUserDialog />
                ) : (
                  <Alert className="max-w-sm mx-auto">
                    <AlertDescription>Run the database setup script to enable user invitations.</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      {selectedUser && (
        <UserManagementDialog
          user={selectedUser}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onUserUpdated={handleUserUpdated}
          mode={dialogMode}
        />
      )}
    </div>
  )
}
