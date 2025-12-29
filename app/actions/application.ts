// app/actions/application.ts 
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logWorkerActivity } from "@/lib/worker-activity"

export async function applyForJob(jobId: string, proposedAmount?: number, coverLetter?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is a worker
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "worker") {
    throw new Error("Only workers can apply for jobs")
  }

  // Check if job exists and is open
  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, status")
    .eq("id", jobId)
    .single()

  if (!job || job.status !== "open") {
    throw new Error("Job not found or not open for applications")
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("worker_id", user.id)
    .single()

  if (existingApplication) {
    throw new Error("You have already applied for this job")
  }

  // Create application
  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      worker_id: user.id,
      status: "pending",
      proposed_amount: proposedAmount,
      cover_letter: coverLetter,
    })
    .select()
    .single()

  if (error) throw error

  await logWorkerActivity({
    supabase,
    workerId: user.id,
    type: "job_applied",
    message: "You applied for a new job",
    metadata: {
      job_id: jobId,
      application_id: application.id,
      proposed_amount: proposedAmount,
    },
  })

  // Create notification for client
  await supabase.from("notifications").insert({
    user_id: job.client_id,
    type: "new_application",
    title: "New Job Application",
    message: `A worker has applied for your job "${jobId}"`,
    data: { 
      job_id: jobId,
      application_id: application.id,
      worker_id: user.id 
    },
    read: false,
  })

  revalidatePath("/worker/dashboard")
  revalidatePath(`/worker/jobs/${jobId}`)

  return application
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is a worker
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "worker") {
    throw new Error("Only workers can update application status")
  }

  // Update application status
  const { error } = await supabase
    .from("applications")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", applicationId)
    .eq("worker_id", user.id)

  if (error) throw error

  await logWorkerActivity({
    supabase,
    workerId: user.id,
    type: "application_updated",
    message: `Application status changed to "${status}"`,
    metadata: {
      application_id: applicationId,
      status,
    },
  })

  revalidatePath("/worker/applications")
}