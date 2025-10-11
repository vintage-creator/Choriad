"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createPaymentIntent } from "@/app/actions/stripe"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface PaymentFormProps {
  booking: {
    id: string
    amount_ngn: number
    commission_ngn: number
    jobs: {
      title: string
    }
    workers: {
      profiles: {
        full_name: string | null
      }
    }
  }
}

export function PaymentForm({ booking }: PaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(booking.amount_ngn, booking.id)

      if (!clientSecret) {
        throw new Error("Failed to create payment intent")
      }

      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate a successful payment
      const supabase = createClient()
      await supabase.from("bookings").update({ payment_status: "paid", status: "confirmed" }).eq("id", booking.id)

      router.push(`/client/bookings/${booking.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Task</p>
            <p className="font-semibold">{booking.jobs.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Worker</p>
            <p className="font-semibold">{booking.workers.profiles?.full_name || "Worker"}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Amount</span>
              <span>₦{booking.amount_ngn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (15%)</span>
              <span>₦{booking.commission_ngn.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₦{(booking.amount_ngn + booking.commission_ngn).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your payment is secured by Stripe. We accept all major cards and bank transfers.
          </p>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <Button onClick={handlePayment} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₦${(booking.amount_ngn + booking.commission_ngn).toLocaleString()}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
