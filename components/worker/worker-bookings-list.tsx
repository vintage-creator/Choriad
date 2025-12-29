"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  DollarSign,
  User,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  Shield,
} from "lucide-react"
import { updateBookingStatus } from "@/app/actions/booking"
import { useState } from "react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface Booking {
  id: string
  status: string
  scheduled_date: string
  amount_ngn: number
  payment_status: string
  estimated_hours: number | null
  created_at: string
  jobs: {
    id: string
    title: string
    description: string
    location_area: string | null
    urgency: string
  }
  profiles: {
    id?: string
    full_name: string | null
    avatar_url: string | null
  }
  client_id?: string
}

interface WorkerBookingsListProps {
  bookings: Booking[]
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    bg: "bg-yellow-50",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
    bg: "bg-blue-50",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TrendingUp,
    bg: "bg-purple-50",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    bg: "bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
    bg: "bg-red-50",
  },
} as const

const paymentStatusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
} as const

export function WorkerBookingsList({ bookings }: WorkerBookingsListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setLoadingId(bookingId)
    try {
      const res = await updateBookingStatus(bookingId, newStatus)
      // if updateBookingStatus returns errors, handle them
      if ((res as any)?.error) {
        throw (res as any).error
      }
      toast.success("Booking status updated")
      // reload to reflect server changes
      router.refresh()
    } catch (error: any) {
      console.error("Failed to update status:", error)
      toast.error(error?.message || "Failed to update booking status")
    } finally {
      setLoadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy • h:mm a")
    } catch {
      return dateString
    }
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            When you apply for jobs and get accepted, your bookings will appear here.
          </p>
          <Button onClick={() => router.push("/worker/jobs")}>Browse Available Jobs</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.status === "in_progress").length}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{bookings.reduce((sum, b) => sum + (b.amount_ngn || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {bookings.map((booking) => {
          const status = statusConfig[booking.status as keyof typeof statusConfig]
          const paymentStatus = paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig]
          const StatusIcon = (status?.icon as any) || Clock

          // Resolve client id safely: prefer profiles.id, fallback to client_id
          const clientId = booking.profiles?.id ?? booking.client_id ?? null

          return (
            <Card key={booking.id} className={`overflow-hidden ${status?.bg} border`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Left: Job Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{booking.jobs?.title}</h3>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge className={status?.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status?.label}
                          </Badge>
                          <Badge className={paymentStatus?.color}>
                            {paymentStatus?.label}
                          </Badge>
                          {booking.jobs?.urgency === "urgent" && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* larger touch area on mobile */}
                          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/worker/bookings/${booking.id}`)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              clientId
                                ? router.push(`/chat?userId=${encodeURIComponent(clientId)}`)
                                : toast.error("Client id not available")
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{booking.jobs?.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {booking.profiles?.avatar_url ? (
                            <AvatarImage src={booking.profiles.avatar_url} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="font-medium">{booking.profiles?.full_name ?? "Client"}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">Scheduled</span>
                        </div>
                        <p className="font-medium">{formatDate(booking.scheduled_date)}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs">Location</span>
                        </div>
                        <p className="font-medium">{booking.jobs?.location_area ?? "N/A"}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Amount</span>
                        </div>
                        <p className="font-medium">₦{(booking.amount_ngn || 0).toLocaleString()}</p>
                        {booking.estimated_hours ? (
                          <p className="text-xs text-gray-500">
                            ~₦{Math.round((booking.amount_ngn || 0) / booking.estimated_hours)}/hr
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Progress Bar for In Progress Bookings */}
                    {booking.status === "in_progress" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Job Progress</span>
                          <span className="text-gray-500">Started {formatDate(booking.created_at)}</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Started</span>
                          <span>In Progress</span>
                          <span>Completed</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 w-full md:min-w-[180px] md:w-auto">
                    {booking.status === "confirmed" && (
                      <Button
                        onClick={() => handleStatusUpdate(booking.id, "in_progress")}
                        disabled={loadingId === booking.id}
                        className="gap-2 w-full md:w-auto"
                      >
                        <TrendingUp className="h-4 w-4" />
                        {loadingId === booking.id ? "Starting..." : "Start Task"}
                      </Button>
                    )}

                    {booking.status === "in_progress" && (
                      <Button
                        onClick={() => handleStatusUpdate(booking.id, "completed")}
                        disabled={loadingId === booking.id}
                        className="gap-2 bg-green-600 hover:bg-green-700 w-full md:w-auto"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {loadingId === booking.id ? "Completing..." : "Mark Complete"}
                      </Button>
                    )}

                    {booking.status === "completed" && booking.payment_status === "paid" && (
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-700">Payment Received</p>
                        <p className="text-sm text-green-600">₦{booking.amount_ngn.toLocaleString()}</p>
                      </div>
                    )}

                    {booking.status === "completed" && booking.payment_status === "pending" && (
                      <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="font-semibold text-yellow-700">Payment Pending</p>
                        <p className="text-sm text-yellow-600">Awaiting client payment</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => router.push(`/worker/bookings/${booking.id}`)}
                      className="gap-2 w-full md:w-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() =>
                        clientId
                          ? router.push(`/chat?userId=${encodeURIComponent(clientId)}`)
                          : toast.error("Client id not available")
                      }
                      className="gap-2 w-full md:w-auto"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Client
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {bookings.length > 10 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            Showing 1-{Math.min(10, bookings.length)} of {bookings.length} bookings
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
