"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react"

export function EmailDebugPanel() {
  const [testEmail, setTestEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testEmailSending = async () => {
    if (!testEmail) {
      setResult({ error: "Please enter an email address" })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          role: "User",
          inviteLink: `${window.location.origin}/auth/invite?token=debug-test-123`,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Network error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email System Debug
        </CardTitle>
        <CardDescription>Test the invitation email system to ensure it's working properly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email to test"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={testEmailSending} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Email"
            )}
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <strong>✅ Email sent successfully!</strong>
                    <br />
                    Email ID: {result.emailId}
                    <br />
                    Check your inbox for the test invitation.
                  </div>
                ) : (
                  <div>
                    <strong>❌ Email failed to send</strong>
                    <br />
                    Error: {result.error}
                    {result.details && (
                      <>
                        <br />
                        Details: {result.details}
                      </>
                    )}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Debug Information:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>API Key: Server-side validation (secure)</li>
            <li>From Address: onboarding@resend.dev (Resend sandbox)</li>
            <li>Email Service: Resend</li>
            <li>Test will validate API key configuration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
