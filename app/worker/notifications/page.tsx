// app/worker/notifications/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { NotificationsList } from "@/components/worker/notifications-list"
import { NotificationPreferences } from "@/components/worker/notification-preferences"
import { Footer } from "@/components/landing/footer"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "worker") {
    redirect("/client/dashboard")
  }

  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!worker) {
    redirect("/worker/setup")
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch notification preferences
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            Manage your notifications and stay updated on jobs, bookings, and payments
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Notifications List */}
          <div className="lg:col-span-2">
            <NotificationsList 
              notifications={notifications || []}
              workerId={user.id}
            />
          </div>

          {/* Preferences Sidebar */}
          <div>
            <NotificationPreferences 
              preferences={preferences || getDefaultPreferences()}
              workerId={user.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function getDefaultPreferences() {
  return {
    id: "",
    user_id: "",
    email_jobs: true,
    email_bookings: true,
    email_payments: true,
    push_jobs: true,
    push_bookings: true,
    push_payments: true,
    push_reviews: true,
    created_at: "",
    updated_at: "",
  }
}