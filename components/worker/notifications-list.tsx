// components/worker/notifications-list.tsx
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Trash2, Filter, BellOff, Bell } from "lucide-react"
import { format } from "date-fns"
import type { Notification } from "@/lib/types"

interface NotificationsListProps {
  notifications: Notification[]
  workerId: string
}

export function NotificationsList({ notifications: initialNotifications, workerId }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    if (filter === "read") return n.read
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", workerId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("user_id", workerId)
        .eq("read", false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", workerId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error("Error deleting notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = async () => {
    const supabase = createClient()
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", workerId)

      if (error) throw error

      setNotifications([])
    } catch (error) {
      console.error("Error clearing notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const notificationTypes = [
    { value: "all", label: "All", count: notifications.length },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "read", label: "Read", count: notifications.length - unreadCount },
    { value: "new_job", label: "Jobs", count: notifications.filter(n => n.type === "new_job").length },
    { value: "booking_request", label: "Bookings", count: notifications.filter(n => 
      ["booking_request", "booking_confirmed", "booking_cancelled"].includes(n.type)
    ).length },
    { value: "payment_received", label: "Payments", count: notifications.filter(n => 
      ["payment_received", "payment_pending"].includes(n.type)
    ).length },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Your Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={isLoading}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isLoading}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filter Tabs */}
        <div className="mb-6">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter by:</span>
              </div>
              <TabsList className="flex flex-wrap h-auto p-1">
                {notificationTypes.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 min-w-5">
                        {type.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={filter} className="mt-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    {filter === "unread" 
                      ? "You have no unread notifications" 
                      : filter === "read"
                      ? "You have no read notifications"
                      : "You have no notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        !notification.read 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline"
                              className={
                                !notification.read 
                                  ? "bg-blue-100 text-blue-800 border-blue-300" 
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {notification.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{notification.title}</h4>
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(notification.id)}
                                disabled={isLoading}
                                className="gap-1 h-8"
                              >
                                <Check className="h-3 w-3" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              disabled={isLoading}
                              className="gap-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === "new_job").length}
            </div>
            <div className="text-sm text-gray-600">Job Alerts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}