import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

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

  const upcomingBookings = bookings?.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'scheduled'
  ) || []

  const completedBookings = bookings?.filter(booking => 
    booking.status === 'completed'
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your Bookings
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage your scheduled tasks and service appointments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-border/50 bg-white/80 backdrop-blur-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-900">{bookings?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-green-900">{upcomingBookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-purple-900">{completedBookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {(!bookings || bookings.length === 0) && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-12 mb-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Get started by posting your first task and our AI will help you find the perfect provider.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link href="/client/jobs/new">Post Your First Task</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}