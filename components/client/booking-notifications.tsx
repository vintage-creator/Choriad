// components/client/booking-notifications.tsx
"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Clock,
  AlertCircle,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface BookingNotification {
  id: string
  type: string
  title: string
  message: string
  data: {
    booking_id?: string
    job_id?: string
    booking_request_id?: string
    payment_url?: string
    amount?: number
    counter_amount?: number
    counter_note?: string
    original_amount?: number
    action_required?: boolean
  }
  read: boolean
  created_at: string
}

export function BookingNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<BookingNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .in("type", [
          "booking_confirmed",
          "booking_rejected", 
          "booking_counter_offer"
        ])
        .eq("read", false) // Only unread
        .order("created_at", { ascending: false })
        .limit(5)

      setNotifications(data || [])
      setIsLoading(false)
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('booking-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as BookingNotification
          if ([
            "booking_confirmed",
            "booking_rejected",
            "booking_counter_offer"
          ].includes(newNotif.type)) {
            setNotifications(prev => [newNotif, ...prev].slice(0, 5))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    const supabase = createBrowserClient()
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleAcceptCounterOffer = async (notificationId: string, bookingRequestId: string, counterAmount: number) => {
    const supabase = createBrowserClient()
    
    try {
      // Update booking request to accepted with counter amount
      const { error: requestError } = await supabase
        .from("booking_requests")
        .update({ 
          status: "client_accepted",
          proposed_amount_ngn: counterAmount, 
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingRequestId)

      if (requestError) throw requestError

      // Get request details
      const { data: request } = await supabase
        .from("booking_requests")
        .select("*, jobs(*)")
        .eq("id", bookingRequestId)
        .single()

      if (!request) throw new Error("Request not found")

      // Create booking with accepted counter amount
      const commission = Math.round(counterAmount * 0.15)
      const workerAmount = counterAmount - commission

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          job_id: request.job_id,
          client_id: userId,
          worker_id: request.worker_id,
          scheduled_date: request.scheduled_date,
          amount_ngn: counterAmount,
          commission_ngn: commission,
          worker_amount_ngn: workerAmount,
          status: "pending_payment",
          payment_status: "pending",
          booking_request_id: bookingRequestId,
          negotiation_rounds: 1,
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Update job status
      await supabase
        .from("jobs")
        .update({ 
          status: "assigned",
          assigned_worker_id: request.worker_id,
          final_amount_ngn: counterAmount 
        })
        .eq("id", request.job_id)

      // Notify worker
      await supabase.from("notifications").insert({
        user_id: request.worker_id,
        type: "booking_confirmed",
        title: "Counter-Offer Accepted!",
        message: `Client accepted your counter-offer of ₦${counterAmount.toLocaleString()} for ${request.jobs.title}. Awaiting payment.`,
        data: { 
          booking_id: booking.id, 
          job_id: request.job_id,
          amount: counterAmount
        },
        read: false,
      })

      // Mark notification as read
      await handleMarkAsRead(notificationId)

      // Redirect to payment
      window.location.href = `/client/bookings/${booking.id}/pay`
    } catch (error) {
      console.error("Error accepting counter-offer:", error)
      toast.error("Failed to accept counter-offer. Please try again.")
    }
  }

  if (isLoading) return null

  if (notifications.length === 0) return null

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">⚡ Booking Updates</h3>
          <Badge variant="destructive" className="animate-pulse">
            {notifications.length} Action{notifications.length !== 1 ? "s" : ""} Required
          </Badge>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const isConfirmed = notification.type === "booking_confirmed"
            const isRejected = notification.type === "booking_rejected"
            const isCounterOffer = notification.type === "booking_counter_offer"

            return (
              <Card key={notification.id} className="border-2 border-slate-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isConfirmed ? "bg-green-100" : 
                        isRejected ? "bg-red-100" : 
                        "bg-amber-100"
                      }`}>
                        {isConfirmed && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {isRejected && <XCircle className="w-5 h-5 text-red-600" />}
                        {isCounterOffer && <MessageSquare className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Counter-Offer Details */}
                    {isCounterOffer && (
                      <div className="p-3 bg-amber-50 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Your Offer</div>
                            <div className="font-semibold text-slate-900">
                              ₦{notification.data.original_amount?.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Counter-Offer</div>
                            <div className="font-semibold text-amber-700">
                              ₦{notification.data.counter_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {notification.data.counter_note && (
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">Note:</span> {notification.data.counter_note}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isConfirmed && notification.data.payment_url && (
                        <Button 
                          asChild 
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                          size="sm"
                        >
                          <Link href={notification.data.payment_url}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Link>
                        </Button>
                      )}

                      {isCounterOffer && (
                        <>
                          <Button
                            onClick={() => handleAcceptCounterOffer(
                              notification.id,
                              notification.data.booking_request_id!,
                              notification.data.counter_amount!
                            )}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}

                      {isRejected && (
                        <Button
                          onClick={() => handleMarkAsRead(notification.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Find Alternatives
                        </Button>
                      )}

                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}