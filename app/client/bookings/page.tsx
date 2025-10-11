import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/client/dashboard-header"
import { BookingsList } from "@/components/client/bookings-list"

export default async function ClientBookingsPage() {
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

  // Get client's bookings with worker details
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, jobs(*), workers(*, profiles(*))")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
          <p className="text-muted-foreground">Manage your scheduled tasks</p>
        </div>
        <BookingsList bookings={bookings || []} />
      </main>
    </div>
  )
}
