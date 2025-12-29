// app/actions/notifications.ts 
"use server"

import { createClient } from "@/lib/supabase/server"

export async function checkForPendingApplications(userId: string) {
  const supabase = await createClient()

  try {
    // Get all jobs posted by this client
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("client_id", userId)
      .eq("status", "open")

    if (!jobs || jobs.length === 0) {
      return { pendingApplications: 0 }
    }

    const jobIds = jobs.map(job => job.id)

    // Count pending applications
    const { count: pendingApplications, error } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("job_id", jobIds)
      .eq("status", "pending")

    if (error) throw error

    return { pendingApplications: pendingApplications || 0 }
  } catch (error) {
    console.error("Error checking pending applications:", error)
    return { pendingApplications: 0, error: "Failed to check applications" }
  }
}

export async function getClientNotifications(userId: string) {
  const supabase = await createClient()

  try {
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return { notifications: notifications || [] }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { notifications: [], error: "Failed to fetch notifications" }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", notificationId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}