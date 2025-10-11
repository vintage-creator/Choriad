import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, DollarSign, User } from "lucide-react"

interface Booking {
  id: string
  status: string
  scheduled_date: string
  amount_ngn: number
  payment_status: string
  jobs: {
    title: string
  }
  workers: {
    profiles: {
      full_name: string | null
    }
    rating: number
  }
}

interface BookingsListProps {
  bookings: Booking[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground mb-4">You don&apos;t have any bookings yet</p>
          <Button asChild>
            <Link href="/client/dashboard">Browse Tasks</Link>
          </Button>
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
                <div className="flex gap-2">
                  <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                    {booking.status.replace("_", " ")}
                  </Badge>
                  <Badge className={paymentStatusColors[booking.payment_status as keyof typeof paymentStatusColors]}>
                    {booking.payment_status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {booking.workers.profiles?.full_name || "Worker"} ({booking.workers.rating.toFixed(1)} ★)
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
              <Button variant="outline" size="sm" asChild>
                <Link href={`/client/bookings/${booking.id}`}>View Details</Link>
              </Button>
              {booking.payment_status === "pending" && (
                <Button size="sm" asChild>
                  <Link href={`/client/bookings/${booking.id}/pay`}>Pay Now</Link>
                </Button>
              )}
              {booking.status === "completed" && booking.payment_status === "paid" && (
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/client/bookings/${booking.id}/review`}>Leave Review</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
