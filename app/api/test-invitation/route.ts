import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Testing invitation API...")

    // Check API key
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 })
    }

    const { email, role = "User", inviteLink } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("📧 Sending test invitation to:", email)

    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "You're Invited to Join Our Blog!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Blog Invitation</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You've been invited to join our blog as a <strong>${role}</strong>. 
              Click the button below to accept your invitation and create your account.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink || "https://example.com/auth/invite?token=test"}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; text-align: center;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    })

    console.log("✅ Test email sent successfully:", result.data?.id)

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message: "Test invitation sent successfully",
    })
  } catch (error) {
    console.error("❌ Test invitation failed:", error)
    return NextResponse.json(
      {
        error: "Failed to send test invitation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
