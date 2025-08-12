"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export function EnvChecker() {
  const envVars = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
    },
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Environment Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {envVars.map((env) => (
          <div key={env.name} className="flex items-center justify-between">
            <span className="text-sm font-mono">{env.name}</span>
            <div className="flex items-center space-x-2">
              {env.value ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="text-xs">
                    {env.value.substring(0, 20)}...
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <Badge variant="destructive" className="text-xs">
                    Missing
                  </Badge>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
