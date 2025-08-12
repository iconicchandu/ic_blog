"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface Settings {
  site_title: string
  site_description: string
  site_url: string
  contact_email: string
  primary_color: string
  font_family: string
  comments_enabled: string
  registration_enabled: string
  newsletter_enabled: string
  analytics_enabled: string
  email_notifications_enabled: string
  new_post_notifications: string
  comment_notifications: string
  cache_duration: string
  posts_per_page: string
  caching_enabled: string
  rate_limiting_enabled: string
  default_user_role: string
  email_verification_required: string
  admin_approval_required: string
  logo_url?: string
}

interface SettingsContextType {
  settings: Settings
  loading: boolean
  updateSettings: (newSettings: Partial<Settings>) => void
  refreshSettings: () => Promise<void>
}

const defaultSettings: Settings = {
  site_title: "IC Blog",
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
  default_user_role: "user",
  email_verification_required: "false",
  admin_approval_required: "false",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("key, value")

      if (error) {
        console.error("Error loading settings:", error)
        setSettings(defaultSettings)
      } else {
        const settingsMap =
          data?.reduce(
            (acc, setting) => {
              acc[setting.key as keyof Settings] = setting.value || ""
              return acc
            },
            {} as Partial<Settings>,
          ) || {}

        setSettings({ ...defaultSettings, ...settingsMap })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const refreshSettings = async () => {
    setLoading(true)
    await loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      root.style.setProperty("--primary-color", settings.primary_color)
      root.style.setProperty("--font-family", settings.font_family)

      // Update document title
      document.title = settings.site_title

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute("content", settings.site_description)
      }
    }
  }, [settings])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
