import { createServerClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"
import { NextResponse } from "next/server"

const WorkerMatchSchema = z.object({
  matches: z.array(
    z.object({
      workerId: z.string(),
      score: z.number().min(0).max(100),
      reasoning: z.string(),
      strengths: z.array(z.string()),
      considerations: z.array(z.string()),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json()

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get job details
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single()

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get available workers in the same city
    const { data: workers } = await supabase
      .from("workers")
      .select(
        `
        *,
        profile:profiles(*)
      `,
      )
      .eq("location", job.location_city)
      .eq("availability_status", "available")
      .gte("rating", 3.0)

    if (!workers || workers.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Use AI to analyze and match workers
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: WorkerMatchSchema,
      prompt: `You are an AI matching agent for Choraid, a service provider platform in Nigeria.

Analyze the following job and available workers, then rank the top 5 best matches.

JOB DETAILS:
- Title: ${job.title}
- Description: ${job.description}
- Category: ${job.category}
- Location: ${job.location_city}, ${job.location_area || "N/A"}
- Budget: ₦${job.budget_min_ngn || 0} - ₦${job.budget_max_ngn || 0}
- Urgency: ${job.urgency}

AVAILABLE WORKERS:
${workers
  .map(
    (w, i) => `
${i + 1}. Worker ID: ${w.user_id}
   Name: ${w.profile.full_name}
   Skills: ${w.skills.join(", ")}
   Experience: ${w.years_of_experience} years
   Rating: ${w.rating}/5 (${w.total_reviews} reviews)
   Hourly Rate: ₦${w.hourly_rate_ngn}
   Completed Jobs: ${w.completed_jobs}
   Bio: ${w.bio}
   Verification: ${w.verification_status}
`,
  )
  .join("\n")}

Rank the top 5 workers based on:
1. Skill match with job category and description
2. Experience level and completed jobs
3. Rating and reviews
4. Hourly rate vs budget
5. Verification status
6. Availability and urgency match

For each match, provide:
- workerId: The worker's user_id
- score: Match score from 0-100
- reasoning: Brief explanation of why this is a good match
- strengths: 2-3 key strengths for this job
- considerations: 1-2 things the client should consider

Return only the top 5 matches, ordered by score (highest first).`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("[v0] AI matching error:", error)
    return NextResponse.json({ error: "Failed to match workers" }, { status: 500 })
  }
}
