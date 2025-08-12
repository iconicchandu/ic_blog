import { EmailDebugPanel } from "@/components/admin/email-debug-panel"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email System Debug</h1>
        <p className="text-gray-600 mt-2">Test and debug the invitation email system</p>
      </div>

      <EmailDebugPanel />
    </div>
  )
}
