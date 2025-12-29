// components/worker/notification-dropdown.tsx
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Bell, 
  Briefcase, 
  Calendar, 
  PiggyBank, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MessageSquare,
  Shield,
  TrendingUp,
  X,
  Settings,
  ExternalLink,
  Check,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import type { Notification } from "@/lib/types"

interface NotificationDropdownProps {
  workerId: string
  city?: string
}

const notificationIcons = {
  new_job: Briefcase,
  booking_request: Calendar,
  booking_confirmed: CheckCircle,
  booking_cancelled: AlertCircle,
  payment_received: PiggyBank,
  payment_pending: Clock,
  review_received: Star,
  system_alert: AlertCircle,
  profile_verified: Shield,
  reminder: Clock,
}

const notificationColors = {
  new_job: "bg-blue-100 text-blue-800 border-blue-200",
  booking_request: "bg-purple-100 text-purple-800 border-purple-200",
  booking_confirmed: "bg-green-100 text-green-800 border-green-200",
  booking_cancelled: "bg-red-100 text-red-800 border-red-200",
  payment_received: "bg-emerald-100 text-emerald-800 border-emerald-200",
  payment_pending: "bg-amber-100 text-amber-800 border-amber-200",
  review_received: "bg-yellow-100 text-yellow-800 border-yellow-200",
  system_alert: "bg-orange-100 text-orange-800 border-orange-200",
  profile_verified: "bg-indigo-100 text-indigo-800 border-indigo-200",
  reminder: "bg-gray-100 text-gray-800 border-gray-200",
}

export function NotificationDropdown({ workerId, city }: NotificationDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
  }, [])
  
  const fetchUnreadCount = async () => {
    const supabase = createClient()
  
    const { data, error } = await supabase
      .from("notifications")
      .select("id, read")
      .eq("user_id", workerId)
      .eq("read", false)
  
    if (!error) {
      setUnreadCount(data?.length || 0)
    }
  }  

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    try {
      // Fetch notifications from database
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", workerId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read)?.length || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Fallback to mock data if real notifications not set up yet
      setNotifications(getMockNotifications())
      setUnreadCount(3) // Mock unread count
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()
  
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${workerId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(channel)
    }
  }, [workerId])
  

  const getMockNotifications = (): Notification[] => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return [
      {
        id: "1",
        user_id: workerId,
        type: "new_job",
        title: "New Job Available",
        message: `Grocery shopping needed in ${city || "your city"}. Budget: ₦5,000`,
        data: { jobId: "job_123", budget: 5000, city },
        read: false,
        created_at: oneHourAgo.toISOString(),
        updated_at: oneHourAgo.toISOString(),
      },
      {
        id: "2",
        user_id: workerId,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: "Your booking for 'Home Cleaning' has been confirmed",
        data: { bookingId: "booking_123", jobTitle: "Home Cleaning" },
        read: false,
        created_at: threeHoursAgo.toISOString(),
        updated_at: threeHoursAgo.toISOString(),
      },
      {
        id: "3",
        user_id: workerId,
        type: "payment_received",
        title: "Payment Received",
        message: "₦15,000 received for completed job",
        data: { amount: 15000, bookingId: "booking_456" },
        read: true,
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
      },
      {
        id: "4",
        user_id: workerId,
        type: "review_received",
        title: "New Review",
        message: "Sarah Johnson gave you a 5-star review",
        data: { rating: 5, reviewer: "Sarah Johnson" },
        read: true,
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
      },
      {
        id: "5",
        user_id: workerId,
        type: "reminder",
        title: "Upcoming Booking",
        message: "You have a booking tomorrow at 10:00 AM",
        data: { bookingId: "booking_789", time: "10:00 AM" },
        read: true,
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
      },
    ]
  }

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", workerId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("user_id", workerId)
        .eq("read", false)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_job':
        router.push(`/worker/jobs${notification.data?.jobId ? `?job=${notification.data.jobId}` : ''}`)
        break
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        router.push(`/worker/bookings${notification.data?.bookingId ? `?booking=${notification.data.bookingId}` : ''}`)
        break
      case 'payment_received':
      case 'payment_pending':
        router.push('/worker/earnings')
        break
      case 'review_received':
        router.push('/worker/profile')
        break
      default:
        // Do nothing for other types
        break
    }
    
    setIsOpen(false)
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return format(date, "MMM d")
    } catch {
      return dateString
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-600 hover:text-primary"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
  align="end"
  className="w-[90vw] sm:w-[420px] md:w-[480px] lg:w-[520px] max-w-[95vw] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/worker/notifications")}
                className="h-8 px-2 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                  <Bell className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll see updates about jobs, bookings, and payments here
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type]
                    const colorClass = notificationColors[notification.type]
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-xs text-blue-600">New</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[400px]">
              {unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                  <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No unread notifications</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.map((notification) => {
                    const Icon = notificationIcons[notification.type]
                    const colorClass = notificationColors[notification.type]
                    
                    return (
                      <div
                        key={notification.id}
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-blue-50/50"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span className="text-xs text-blue-600">New</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                Mark read
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              router.push("/worker/notifications")
              setIsOpen(false)
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}