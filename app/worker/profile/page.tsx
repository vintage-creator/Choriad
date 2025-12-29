import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { WorkerProfileForm } from "@/components/worker/worker-profile-form"
import { Footer } from "@/components/landing/footer"

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
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Professional Profile</h1>
              <p className="text-muted-foreground">Update your information to attract more clients</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last updated</div>
              <div className="font-medium">
                {new Date(worker.updated_at || worker.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <WorkerProfileForm worker={worker} profile={profile} />
      </main>
      <Footer />
    </div>
  )
}