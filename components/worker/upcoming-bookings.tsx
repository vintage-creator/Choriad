// components/worker/upcoming-bookings.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, User, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type JobShape = {
  title?: string | null
  location_area?: string | null
}

type ProfileShape = {
  full_name?: string | null
}

interface Booking {
  id: string
  scheduled_date?: string | null
  jobs?: JobShape | null
  job?: JobShape | null
  profiles?: ProfileShape | null
  workers?: { profiles?: ProfileShape | null } | null
  client?: { profiles?: ProfileShape | null } | null
}

interface UpcomingBookingsProps {
  bookings?: Booking[] | null
}

export function UpcomingBookings({ bookings = [] }: UpcomingBookingsProps) {
  const safeDate = (s?: string | null) => {
    if (!s) return null
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const formatDate = (dateString?: string | null) => {
    const date = safeDate(dateString)
    if (!date) return "TBD"
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString?: string | null) => {
    const date = safeDate(dateString)
    if (!date) return "TBD"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-3">No upcoming bookings scheduled</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/worker/jobs">Find Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/worker/bookings" className="text-primary hover:text-primary/80 text-sm">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => {
            const job = booking.jobs ?? booking.job ?? ({} as JobShape)
            const jobTitle = job?.title ?? "Untitled job"
            const locationArea = job?.location_area ?? "Unknown location"

            const profile =
              booking.profiles ??
              booking.workers?.profiles ??
              booking.client?.profiles ??
              ({} as ProfileShape)
            const personName = profile?.full_name ?? "Client"

            return (
              <div
                key={booking.id}
                className="group p-3 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {jobTitle}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <User className="h-3 w-3" />
                      {personName}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {formatDate(booking.scheduled_date ?? null)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(booking.scheduled_date ?? null)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationArea}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
