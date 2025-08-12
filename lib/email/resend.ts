import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required")
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const sendInvitationEmail = async ({
  to,
  inviterName,
  inviterEmail,
  role,
  inviteUrl,
  message,
  siteName = "IC Blog", // Updated default site name from "Your Blog" to "IC Blog"
}: {
  to: string
  inviterName: string
  inviterEmail: string
  role: string
  inviteUrl: string
  message?: string
  siteName?: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${siteName} <onboarding@resend.dev>`,
      to: [to],
      subject: `You've been invited to join ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to ${siteName}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi there!</p>
              
              <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to join <strong>${siteName}</strong> as a <strong>${role}</strong>.</p>
              
              ${
                message
                  ? `<div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-style: italic;">"${message}"</p>
              </div>`
                  : ""
              }
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)

      if (error.message?.includes("verify a domain") || error.message?.includes("testing emails")) {
        return {
          success: false,
          requiresDomainVerification: true,
          error:
            "Domain verification required. You can only send emails to verified addresses without a custom domain.",
          inviteUrl,
        }
      }

      throw new Error(`Failed to send invitation email: ${error.message}`)
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending invitation email:", error)

    if (error.message?.includes("403") || error.message?.includes("verify a domain")) {
      return {
        success: false,
        requiresDomainVerification: true,
        error: "Domain verification required. You can only send emails to verified addresses without a custom domain.",
        inviteUrl,
      }
    }

    throw error
  }
}
