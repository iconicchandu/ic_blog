const { Resend } = require("resend")

async function testEmailSetup() {
  console.log("🔍 Testing Resend Email Setup...\n")

  // Check if API key exists
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY not found in environment variables")
    return
  }

  console.log("✅ RESEND_API_KEY found:", apiKey.substring(0, 10) + "...")

  // Initialize Resend
  const resend = new Resend(apiKey)

  try {
    // Test sending a simple email
    console.log("📧 Sending test invitation email...")

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "test@example.com", // This won't actually send, just tests the API
      subject: "Test Blog Invitation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited to Join Our Blog!</h2>
          <p>This is a test email to verify the invitation system is working.</p>
          <a href="https://example.com/auth/invite?token=test123" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
      `,
    })

    console.log("✅ Email API test successful!")
    console.log("📧 Email ID:", result.data?.id)
    console.log("📊 Full response:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("❌ Email sending failed:")
    console.error("Error message:", error.message)
    console.error("Error details:", error)
  }
}

// Run the test
testEmailSetup()
