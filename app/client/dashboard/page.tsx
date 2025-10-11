import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/client/dashboard-header"
import { JobsList } from "@/components/client/jobs-list"
import { DashboardStats } from "@/components/client/dashboard-stats"
import { AIAgentCard } from "@/components/client/ai-agent-card"

export default async function ClientDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard")
  }

  // Get client's jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  // Get bookings count
  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || "there"}!</h1>
          <p className="text-muted-foreground">Manage your tasks and bookings</p>
        </div>

        <div className="mb-8">
          <AIAgentCard />
        </div>

        <DashboardStats jobs={jobs || []} bookingsCount={bookingsCount || 0} />
        <JobsList jobs={jobs || []} />
      </main>
    </div>
  )
}
