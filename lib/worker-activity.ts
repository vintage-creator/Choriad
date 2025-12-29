import { createClient } from "@/lib/supabase/server"

type WorkerActivityType =
  | "job_applied"
  | "application_updated"
  | "job_assigned"
  | "job_selected"
  | "job_started"
  | "job_completed"
  | "payment_received"
  | "review_received"
  | "notification"

export async function logWorkerActivity({
  supabase,
  workerId,
  type,
  message,
  metadata,
}: {
  supabase?: any
  workerId: string
  type: WorkerActivityType
  message: string
  metadata?: Record<string, any>
}) {
  const client = supabase ?? (await createClient())

  await client.from("worker_activity").insert({
    worker_id: workerId,
    type,
    message,
    metadata: metadata ?? {},
  })
}
