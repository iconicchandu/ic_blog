import { AuthForm } from "@/components/auth/auth-form"
import { RedirectHandler } from "@/components/auth/redirect-handler"

export default function AuthPage() {
  return (
    <>
      <RedirectHandler />
      <AuthForm />
    </>
  )
}
