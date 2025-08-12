import { type NextRequest, NextResponse } from "next/server"
import { sendInvitationEmail } from "@/lib/email/resend"

export async function POST(request: NextRequest) {
  try {
    const { email, role, message, inviteUrl, inviterName, inviterEmail } = await request.json()

    // Validate required fields
    if (!email || !role || !inviteUrl || !inviterName || !inviterEmail) {
      console.error("Missing required fields:", { email, role, inviteUrl, inviterName, inviterEmail })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Sending invitation email to:", email)

    // Send the invitation email
    await sendInvitationEmail({
      to: email,
      inviterName,
      inviterEmail,
      role,
      inviteUrl,
      message,
      siteName: "Your Blog", // You can make this configurable
    })

    console.log("Invitation email sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-invitation API:", error)
    return NextResponse.json(
      {
        error: "Failed to send invitation email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
