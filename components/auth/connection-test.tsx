"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { SupabaseSetupGuide } from "../debug/supabase-setup-guide"

export function ConnectionTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState("")
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // First, check if environment variables are available
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setStatus("error")
          setMessage("Environment variables missing")
          setDetails(`URL: ${supabaseUrl ? "✓" : "✗"}, Key: ${supabaseKey ? "✓" : "✗"}`)
          setShowSetupGuide(true)
          return
        }

        // Check if the key looks like a placeholder
        if (supabaseKey.includes("YOUR_") || supabaseKey.includes("HERE") || supabaseKey.length < 100) {
          setStatus("error")
          setMessage("Please replace placeholder API keys with real ones")
          setDetails("The API keys in .env.local need to be replaced with actual keys from Supabase")
          setShowSetupGuide(true)
          return
        }

        setDetails(`Testing connection to: ${supabaseUrl}`)

        const supabase = createClient()

        // Test basic connection with a simple query that doesn't require tables
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setStatus("error")
          if (
            error.message.includes("Invalid API key") ||
            error.message.includes("JWT") ||
            error.message.includes("invalid")
          ) {
            setMessage("Invalid API key - Please check your Supabase configuration")
            setDetails("The anon key in your .env.local file is not valid")
            setShowSetupGuide(true)
          } else {
            setMessage(`Connection failed: ${error.message}`)
            setDetails(`Error code: ${error.status || "unknown"}`)
          }
        } else {
          // Connection successful, now test database access
          try {
            const { error: dbError } = await supabase.from("posts").select("count", { count: "exact", head: true })

            if (dbError) {
              if (dbError.message.includes("relation") || dbError.message.includes("does not exist")) {
                setStatus("success")
                setMessage("Connected to Supabase! Database tables need to be created.")
                setDetails("Run the SQL scripts to create the database tables")
              } else {
                setStatus("error")
                setMessage(`Database error: ${dbError.message}`)
                setDetails(`Error code: ${dbError.code || "unknown"}`)
              }
            } else {
              setStatus("success")
              setMessage("Successfully connected to Supabase!")
              setDetails("Database is accessible and tables exist")
            }
          } catch (dbErr: any) {
            setStatus("success")
            setMessage("Connected to Supabase! Database setup may be needed.")
            setDetails("Connection works, but database tables may need to be created")
          }

          setShowSetupGuide(false)
        }
      } catch (err: any) {
        setStatus("error")
        if (err.message.includes("Invalid API key") || err.message.includes("JWT") || err.message.includes("fetch")) {
          setMessage("Connection failed - Check your API keys")
          setDetails("Please verify your Supabase URL and API keys are correct")
          setShowSetupGuide(true)
        } else {
          setMessage(`Connection failed: ${err.message}`)
          setDetails(`Error type: ${err.name || "Unknown"}`)
        }
        console.error("Connection test error:", err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="space-y-4">
      <Alert
        className={`${
          status === "success"
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : status === "error"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
        }`}
      >
        <div className="flex items-start space-x-2">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin mt-0.5" />}
          {status === "success" && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
          {status === "error" && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}

          <div className="flex-1">
            <AlertDescription
              className={
                status === "success"
                  ? "text-green-800 dark:text-green-200"
                  : status === "error"
                    ? "text-red-800 dark:text-red-200"
                    : "text-yellow-800 dark:text-yellow-200"
              }
            >
              <div className="font-medium">{message}</div>
              {details && <div className="text-xs mt-1 opacity-75">{details}</div>}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {showSetupGuide && <SupabaseSetupGuide />}
    </div>
  )
}
