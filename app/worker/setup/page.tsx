import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerSetupForm } from "@/components/worker/worker-setup-form"

export default async function WorkerSetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "worker") {
    redirect("/client/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Complete Your Worker Profile</h1>
          <p className="text-muted-foreground">Tell us about your skills and experience</p>
        </div>
        <WorkerSetupForm userId={user.id} />
      </div>
    </div>
  )
}
