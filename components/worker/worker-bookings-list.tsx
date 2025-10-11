"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, User } from "lucide-react"
import { updateBookingStatus } from "@/app/actions/booking"
import { useState } from "react"

interface Booking {
  id: string
  status: string
  scheduled_date: string
  amount_ngn: number
  payment_status: string
  jobs: {
    title: string
    description: string
  }
  profiles: {
    full_name: string | null
  }
}

interface WorkerBookingsListProps {
  bookings: Booking[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function WorkerBookingsList({ bookings }: WorkerBookingsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setLoadingId(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setLoadingId(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You don&apos;t have any bookings yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{booking.jobs.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">{booking.jobs.description}</p>
                <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                  {booking.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Client: {booking.profiles?.full_name || "Client"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(booking.scheduled_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />₦{booking.amount_ngn.toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              {booking.status === "confirmed" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(booking.id, "in_progress")}
                  disabled={loadingId === booking.id}
                >
                  Start Task
                </Button>
              )}
              {booking.status === "in_progress" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(booking.id, "completed")}
                  disabled={loadingId === booking.id}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
