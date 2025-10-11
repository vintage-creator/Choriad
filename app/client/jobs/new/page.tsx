import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/client/dashboard-header"
import { JobPostForm } from "@/components/client/job-post-form"

export default async function NewJobPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a New Task</h1>
          <p className="text-muted-foreground">Tell us what you need help with</p>
        </div>
        <JobPostForm userId={user.id} />
      </main>
    </div>
  )
}
