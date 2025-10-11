import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { WorkerStats } from "@/components/worker/worker-stats"
import { AvailableJobs } from "@/components/worker/available-jobs"

export default async function WorkerDashboardPage() {
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

  // Get or create worker profile
  const { data: worker } = await supabase.from("workers").select("*").eq("id", user.id).single()

  // If worker profile doesn't exist, redirect to setup
  if (!worker) {
    redirect("/worker/setup")
  }

  // Get available jobs matching worker's location
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, profiles(*)")
    .eq("status", "open")
    .eq("location_city", worker.location_city)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get worker's bookings
  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("worker_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || "there"}!</h1>
          <p className="text-muted-foreground">Find tasks that match your skills</p>
        </div>
        <WorkerStats worker={worker} bookingsCount={bookingsCount || 0} />
        <AvailableJobs jobs={jobs || []} workerSkills={worker.skills} />
      </main>
    </div>
  )
}
