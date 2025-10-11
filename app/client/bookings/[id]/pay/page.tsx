import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/client/dashboard-header"
import { PaymentForm } from "@/components/client/payment-form"

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params
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

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, jobs(*), workers(*, profiles(*))")
    .eq("id", id)
    .eq("client_id", user.id)
    .single()

  if (!booking) {
    notFound()
  }

  if (booking.payment_status === "paid") {
    redirect(`/client/bookings/${id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment for your booking</p>
        </div>
        <PaymentForm booking={booking} />
      </main>
    </div>
  )
}
