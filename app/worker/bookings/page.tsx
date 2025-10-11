import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { WorkerBookingsList } from "@/components/worker/worker-bookings-list"

export default async function WorkerBookingsPage() {
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

  // Get worker's bookings with client details
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, jobs(*), profiles!bookings_client_id_fkey(*)")
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
          <p className="text-muted-foreground">Manage your scheduled tasks</p>
        </div>
        <WorkerBookingsList bookings={bookings || []} />
      </main>
    </div>
  )
}
