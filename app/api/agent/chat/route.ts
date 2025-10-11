import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

const searchWorkersTool = tool({
  description:
    "Search for available workers based on job requirements. Use this to find workers who match the client needs.",
  inputSchema: z.object({
    skills: z.array(z.string()).describe("Required skills for the job"),
    location: z.string().describe("Job location"),
    maxBudget: z.number().optional().describe("Maximum budget in Naira"),
  }),
  async execute({ skills, location, maxBudget }) {
    const supabase = await createClient()

    const query = supabase
      .from("workers")
      .select("*, profiles(full_name, avatar_url)")
      .eq("is_available", true)
      .gte("rating", 4.0)
      .order("rating", { ascending: false })
      .limit(5)

    const { data: workers, error } = await query

    if (error || !workers) {
      return { success: false, workers: [], message: "No workers found" }
    }

    // Filter by skills and location
    const matchedWorkers = workers.filter((worker) => {
      const hasSkills = skills.some((skill) =>
        worker.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())),
      )
      const inLocation = worker.service_areas?.some((area: string) =>
        area.toLowerCase().includes(location.toLowerCase()),
      )
      const withinBudget = !maxBudget || worker.hourly_rate <= maxBudget

      return hasSkills && inLocation && withinBudget
    })

    return {
      success: true,
      workers: matchedWorkers.map((w) => ({
        id: w.id,
        name: w.profiles?.full_name,
        skills: w.skills,
        rating: w.rating,
        hourlyRate: w.hourly_rate,
        completedJobs: w.completed_jobs,
        responseTime: w.response_time,
      })),
      message: `Found ${matchedWorkers.length} qualified workers`,
    }
  },
})

const createBookingTool = tool({
  description: "Autonomously create a booking with a selected worker. Use this after finding suitable workers.",
  inputSchema: z.object({
    workerId: z.string().describe("The ID of the selected worker"),
    jobTitle: z.string().describe("Title of the job"),
    jobDescription: z.string().describe("Detailed description of the job"),
    location: z.string().describe("Job location"),
    scheduledDate: z.string().describe("Scheduled date for the job"),
    budget: z.number().describe("Agreed budget in Naira"),
    clientId: z.string().describe("The client user ID"),
  }),
  async execute({ workerId, jobTitle, jobDescription, location, scheduledDate, budget, clientId }) {
    const supabase = await createClient()

    // Create the job first
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        client_id: clientId,
        title: jobTitle,
        description: jobDescription,
        category: "general",
        location,
        budget,
        status: "assigned",
        assigned_worker_id: workerId,
      })
      .select()
      .single()

    if (jobError || !job) {
      return {
        success: false,
        message: `Failed to create job: ${jobError?.message}`,
      }
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        job_id: job.id,
        client_id: clientId,
        worker_id: workerId,
        scheduled_date: scheduledDate,
        status: "confirmed",
        total_amount: budget,
        commission_amount: budget * 0.15,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return {
        success: false,
        message: `Failed to create booking: ${bookingError?.message}`,
      }
    }

    return {
      success: true,
      bookingId: booking.id,
      jobId: job.id,
      message: `Successfully created booking #${booking.id}. The worker has been notified and will confirm shortly.`,
    }
  },
})

const getClientPreferencesTool = tool({
  description: "Get the client profile and preferences to understand their needs better",
  inputSchema: z.object({
    clientId: z.string().describe("The client user ID"),
  }),
  async execute({ clientId }) {
    const supabase = await createClient()

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", clientId).single()

    const { data: pastJobs } = await supabase
      .from("jobs")
      .select("category, location, budget")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      profile,
      pastJobs,
      message: "Retrieved client preferences",
    }
  },
})

const checkWorkerAvailabilityTool = tool({
  description: "Check if a specific worker is available for a given date",
  inputSchema: z.object({
    workerId: z.string().describe("The worker ID to check"),
    date: z.string().describe("The date to check availability"),
  }),
  async execute({ workerId, date }) {
    const supabase = await createClient()

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("worker_id", workerId)
      .eq("scheduled_date", date)
      .in("status", ["pending", "confirmed", "in_progress"])

    const isAvailable = !bookings || bookings.length === 0

    return {
      available: isAvailable,
      message: isAvailable ? "Worker is available on this date" : "Worker has existing bookings on this date",
    }
  },
})

const tools = {
  searchWorkers: searchWorkersTool,
  createBooking: createBookingTool,
  getClientPreferences: getClientPreferencesTool,
  checkWorkerAvailability: checkWorkerAvailabilityTool,
} as const

export type AgentChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<AgentChatMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: "openai/gpt-5",
    system: `You are Choraid AI Agent, an autonomous assistant that helps busy professionals in Nigerian cities find and book trusted service providers.

Your capabilities:
- Search for qualified workers based on job requirements
- Analyze worker profiles, ratings, and availability
- Autonomously create bookings when you have all necessary information
- Handle negotiations and scheduling

Your personality:
- Professional yet friendly and approachable
- Proactive - take initiative to complete tasks
- Transparent - always explain what you're doing
- Nigerian context-aware - understand local needs and culture

When a client describes what they need:
1. Ask clarifying questions if needed (budget, location, timing, specific requirements)
2. Search for suitable workers using the searchWorkers tool
3. Check availability if needed
4. Present the best options with reasoning
5. If the client approves or you have enough information, autonomously create the booking
6. Confirm the booking details and next steps

Always use Nigerian Naira (₦) for pricing and be mindful of Lagos, Abuja, and Port Harcourt locations.`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools,
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse()
}
