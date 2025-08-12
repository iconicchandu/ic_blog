"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSettings } from "@/lib/contexts/settings-context"
import {
  Settings,
  Globe,
  Shield,
  Palette,
  Database,
  Bell,
  Users,
  Save,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings: globalSettings, refreshSettings } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [settings, setSettings] = useState<Record<string, string>>(globalSettings)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setHasError(false)
      setErrorMessage("")

      const { data, error } = await supabase.from("site_settings").select("key, value")

      if (error) {
        if (error.message.includes("relation") || error.message.includes("does not exist")) {
          setHasError(true)
          setErrorMessage("Settings table doesn't exist. Please run the database setup script.")
          // Set default settings
          setSettings({
            site_title: "BlogSpace",
            site_description: "A modern blog platform built with Next.js and Supabase",
            site_url: "https://yourblog.com",
            contact_email: "contact@yourblog.com",
            primary_color: "#3B82F6",
            font_family: "Inter",
            comments_enabled: "true",
            registration_enabled: "true",
            newsletter_enabled: "false",
            analytics_enabled: "true",
            email_notifications_enabled: "true",
            new_post_notifications: "true",
            comment_notifications: "true",
            cache_duration: "60",
            posts_per_page: "10",
            caching_enabled: "true",
            rate_limiting_enabled: "true",
          })
        } else {
          throw error
        }
      } else {
        const settingsMap =
          data?.reduce(
            (acc, setting) => {
              acc[setting.key] = setting.value || ""
              return acc
            },
            {} as Record<string, string>,
          ) || {}

        // Set defaults for missing settings
        const defaultSettings = {
          site_title: "BlogSpace",
          site_description: "A modern blog platform built with Next.js and Supabase",
          site_url: "https://yourblog.com",
          contact_email: "contact@yourblog.com",
          primary_color: "#3B82F6",
          font_family: "Inter",
          comments_enabled: "true",
          registration_enabled: "true",
          newsletter_enabled: "false",
          analytics_enabled: "true",
          email_notifications_enabled: "true",
          new_post_notifications: "true",
          comment_notifications: "true",
          cache_duration: "60",
          posts_per_page: "10",
          caching_enabled: "true",
          rate_limiting_enabled: "true",
        }

        setSettings({ ...defaultSettings, ...settingsMap })
      }
    } catch (error: any) {
      console.error("Error loading settings:", error)
      setHasError(true)
      setErrorMessage(error.message || "Failed to load settings")
    } finally {
      setIsInitialLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    if (hasError) {
      // If table doesn't exist, just update local state
      setSettings((prev) => ({ ...prev, [key]: value }))
      return
    }

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() })

      if (error) throw error

      setSettings((prev) => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error("Error updating setting:", error)
      throw error
    }
  }

  const handleSaveSettings = async () => {
    if (hasError) {
      toast({
        title: "Cannot Save",
        description: "Settings table doesn't exist. Run the database setup script first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Save all settings
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from("site_settings").upsert(updates)

      if (error) throw error

      await refreshSettings()

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSwitchChange = (key: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked.toString() }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `logo.${fileExt}`

      const { data, error } = await supabase.storage.from("uploads").upload(fileName, file, { upsert: true })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(fileName)

      handleInputChange("logo_url", publicUrl)

      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your blog settings and preferences</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your blog settings and preferences</p>
      </div>

      {hasError && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Limited functionality:</strong> {errorMessage} You can preview settings but changes won't be saved
            until the database is set up.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-title">Site Title</Label>
                  <Input
                    id="site-title"
                    value={settings.site_title || ""}
                    onChange={(e) => handleInputChange("site_title", e.target.value)}
                    placeholder="Your Blog Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={settings.site_url || ""}
                    onChange={(e) => handleInputChange("site_url", e.target.value)}
                    placeholder="https://yourblog.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={settings.site_description || ""}
                  onChange={(e) => handleInputChange("site_description", e.target.value)}
                  placeholder="Describe your blog..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.contact_email || ""}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="contact@yourblog.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comments</Label>
                  <p className="text-sm text-muted-foreground">Allow readers to comment on posts</p>
                </div>
                <Switch
                  checked={settings.comments_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("comments_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings.registration_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("registration_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-sm text-muted-foreground">Enable newsletter subscriptions</p>
                </div>
                <Switch
                  checked={settings.newsletter_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("newsletter_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Track site analytics</p>
                </div>
                <Switch
                  checked={settings.analytics_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("analytics_enabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Globe className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </label>
                    </Button>
                    {settings.logo_url && (
                      <Button variant="outline" size="sm" onClick={() => handleInputChange("logo_url", "")}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={settings.primary_color || "#3B82F6"}
                    onChange={(e) => handleInputChange("primary_color", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primary_color || "#3B82F6"}
                    onChange={(e) => handleInputChange("primary_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.font_family || "Inter"}
                  onChange={(e) => handleInputChange("font_family", e.target.value)}
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Default User Role</Label>
                  <p className="text-sm text-muted-foreground">Role assigned to new users</p>
                </div>
                <select
                  className="p-2 border rounded-md"
                  value={settings.default_user_role || "user"}
                  onChange={(e) => handleInputChange("default_user_role", e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.email_verification_required === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("email_verification_required", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Admin Approval</Label>
                  <p className="text-sm text-muted-foreground">Require admin approval for new accounts</p>
                </div>
                <Switch
                  checked={settings.admin_approval_required === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("admin_approval_required", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <Switch
                  checked={settings.email_notifications_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("email_notifications_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Post Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new posts are published</p>
                </div>
                <Switch
                  checked={settings.new_post_notifications === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("new_post_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new comments</p>
                </div>
                <Switch
                  checked={settings.comment_notifications === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("comment_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database & Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cache Duration (minutes)</Label>
                <Input
                  type="number"
                  value={settings.cache_duration || "60"}
                  onChange={(e) => handleInputChange("cache_duration", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Posts Per Page</Label>
                <Input
                  type="number"
                  value={settings.posts_per_page || "10"}
                  onChange={(e) => handleInputChange("posts_per_page", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">Cache pages for better performance</p>
                </div>
                <Switch
                  checked={settings.caching_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("caching_enabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Limit login attempts</p>
                </div>
                <Switch
                  checked={settings.rate_limiting_enabled === "true"}
                  onCheckedChange={(checked) => handleSwitchChange("rate_limiting_enabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading || hasError}>
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {hasError ? "Setup Database First" : "Save Settings"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
