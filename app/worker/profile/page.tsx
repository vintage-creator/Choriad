import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { WorkerProfileForm } from "@/components/worker/worker-profile-form"

export default async function WorkerProfilePage() {
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

  const { data: worker } = await supabase.from("workers").select("*").eq("id", user.id).single()

  if (!worker) {
    redirect("/worker/setup")
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Your Profile</h1>
          <p className="text-muted-foreground">Update your information and skills</p>
        </div>
        <WorkerProfileForm worker={worker} />
      </main>
    </div>
  )
}
