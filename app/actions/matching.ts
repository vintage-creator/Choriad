//app/actions/matching.ts
"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getAIMatchedWorkers(jobId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/ai/match-workers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch matches")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error fetching AI matches:", error)
    return { matches: [] }
  }
}

export async function assignWorkerToJob(jobId: string, workerId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Update job status and assign worker
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "assigned",
      assigned_worker_id: workerId,
    })
    .eq("id", jobId)
    .eq("client_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
