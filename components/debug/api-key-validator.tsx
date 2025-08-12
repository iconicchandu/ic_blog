"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function ApiKeyValidator() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isValidUrl = supabaseUrl && supabaseUrl.includes("supabase.co")
  const isValidKey = supabaseKey && supabaseKey.startsWith("eyJ") && supabaseKey.length > 100
  const isPlaceholder = supabaseKey && (supabaseKey.includes("YOUR_") || supabaseKey.includes("HERE"))

  const correctEnvFile = `# Copy this to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://wfvnkdwrbturnejyffqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmdm5rZHdyYnR1cm5lanlmZnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTkwMTgsImV4cCI6MjA3MDEzNTAxOH0.REPLACE_WITH_YOUR_ACTUAL_ANON_KEY_SIGNATURE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmdm5rZHdyYnR1cm5lanlmZnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1OTAxOCwiZXhwIjoyMDcwMTM1MDE4fQ.doBqzq4EAJQQGF4t0P1oLv8B9TUAPFVIY7TsERsJw_4`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          API Key Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium text-sm">Supabase URL</div>
              <div className="text-xs text-muted-foreground font-mono">{supabaseUrl || "Not set"}</div>
            </div>
            {isValidUrl ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium text-sm">Anon Key</div>
              <div className="text-xs text-muted-foreground font-mono">
                {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "Not set"}
              </div>
            </div>
            {isValidKey ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : isPlaceholder ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>

        {(!isValidKey || isPlaceholder) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isPlaceholder
                ? "You're using placeholder API keys. Replace them with real keys from your Supabase dashboard."
                : "Invalid or missing API key. Get your real anon key from Supabase."}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="font-medium text-sm">Correct .env.local format:</div>
          <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {correctEnvFile}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-transparent"
              onClick={() => copyToClipboard(correctEnvFile)}
            >
              {copied ? "Copied!" : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Important:</strong> Get your real anon key from{" "}
            <a
              href="https://supabase.com/dashboard/project/wfvnkdwrbturnejyffqr/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              your Supabase dashboard
            </a>{" "}
            and replace "REPLACE_WITH_YOUR_ACTUAL_ANON_KEY_SIGNATURE" with the part after the last dot.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
