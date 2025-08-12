import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

export default async function TestConnectionPage() {
  let connectionStatus = "loading"
  let message = ""
  let details = ""

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("posts").select("count", { count: "exact", head: true })

    if (error) {
      connectionStatus = "error"
      message = `Connection failed: ${error.message}`
      details = `Error code: ${error.code || "unknown"}`
    } else {
      connectionStatus = "success"
      message = "Successfully connected to Supabase!"
      details = "Database is accessible from server-side"
    }
  } catch (err: any) {
    connectionStatus = "error"
    message = `Connection failed: ${err.message}`
    details = `Error type: ${err.name || "Unknown"}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-2">
            {connectionStatus === "success" && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
            {connectionStatus === "error" && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}

            <div className="flex-1">
              <div className="font-medium">{message}</div>
              {details && <div className="text-sm text-muted-foreground mt-1">{details}</div>}
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded text-sm">
            <div className="font-medium mb-2">Environment Variables:</div>
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}</div>
            <div>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
