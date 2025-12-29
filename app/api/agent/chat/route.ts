// api/agent/chat/route.ts
import {
  convertToModelMessages,
  type InferUITools,
  tool,
  type UIDataTypes,
  type UIMessage,
  validateUIMessages,
} from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

/**
 * Helper: safe numeric coercion
 */
function toNum(v: any): number {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ---------------------------
   ENHANCED TOOLS with Negotiation & Payment
   --------------------------- */

const searchWorkersTool = tool({
  description: "Search for available workers and rank them by match quality (top 3)",
  inputSchema: z.object({
    skills: z.array(z.string()).describe("Required skills"),
    location: z.string().describe("Job location"),
    maxBudget: z.number().optional().describe("Maximum budget in Naira"),
    urgency: z.enum(["today", "this_week", "flexible"]).optional(),
  }),
  async execute({ skills, location, maxBudget, urgency }) {
    const supabase = await createClient();

    const { data: workers, error } = await supabase
      .from("workers")
      .select(`
        *,
        profiles!workers_id_fkey(full_name, avatar_url, email)
      `)
      .eq("availability_status", "available")
      .gte("rating", 3.5)
      .order("rating", { ascending: false })
      .limit(10);

    if (error || !workers) {
      return { success: false, workers: [], message: "No workers found" };
    }

    // AI-powered ranking logic
    const matchedWorkers = workers
      .map((worker: any) => {
        let matchScore = 0;

        // Skill match (40 points) - protect div-by-zero when skills array is empty
        const workerSkills: string[] = Array.isArray(worker.skills) ? worker.skills : [];
        const requestedSkills = Array.isArray(skills) ? skills : [];
        const skillMatchCount =
          requestedSkills.length > 0
            ? requestedSkills.filter((skill) =>
                workerSkills.some((s: string) =>
                  String(s).toLowerCase().includes(skill.toLowerCase())
                )
              ).length
            : 0;
        const skillScore = requestedSkills.length > 0 ? (skillMatchCount / requestedSkills.length) * 40 : 0;
        matchScore += skillScore;

        // Location match (20 points)
        try {
          if (worker.location_city && location) {
            if (String(worker.location_city).toLowerCase().includes(String(location).toLowerCase())) {
              matchScore += 20;
            }
          }
        } catch (e) {
          // ignore
        }

        // Budget fit (20 points) - coerce numeric values
        const hourlyRate = toNum(worker.hourly_rate_ngn);
        const maxBudgetNum = toNum(maxBudget);
        if (maxBudgetNum > 0 && hourlyRate > 0) {
          if (hourlyRate <= maxBudgetNum) {
            matchScore += 20;
          } else if (hourlyRate <= maxBudgetNum * 1.2) {
            matchScore += 10; // Within 20% of budget
          }
        }

        // Rating (10 points)
        const ratingNum = toNum(worker.rating);
        matchScore += (ratingNum / 5) * 10;

        // Experience (10 points)
        const completedJobsNum = toNum(worker.completed_jobs);
        matchScore += Math.min(completedJobsNum / 10, 1) * 10;

        const profile = Array.isArray(worker.profiles) ? worker.profiles[0] : worker.profiles;

        // Clamp and round
        matchScore = Math.max(0, Math.min(100, Number(matchScore)));

        return {
          id: worker.id,
          name: profile?.full_name || "Worker",
          skills: workerSkills,
          rating: ratingNum || 0,
          totalReviews: toNum(worker.total_reviews) || 0,
          hourlyRate: hourlyRate || 0,
          completedJobs: completedJobsNum || 0,
          location: worker.location_city || null,
          verified: worker.verification_status === "verified",
          matchScore: Math.round(matchScore),
          availability: worker.available_days || [],
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // TOP 3 matches

    return {
      success: true,
      workers: matchedWorkers,
      message: `Found ${matchedWorkers.length} top matches`,
    };
  },
});

const negotiatePriceTool = tool({
  description: "Negotiate price with a worker based on client budget and worker rate",
  inputSchema: z.object({
    workerId: z.string(),
    workerRate: z.number().describe("Worker's hourly/fixed rate"),
    clientBudget: z.number().describe("Client's maximum budget"),
    jobComplexity: z.enum(["simple", "moderate", "complex"]).optional(),
  }),
  async execute({ workerId, workerRate, clientBudget, jobComplexity = "moderate" }) {
    // Coerce to numbers
    const wRate = toNum(workerRate);
    const cBudget = toNum(clientBudget);

    // Defensive checks
    const difference = wRate - cBudget;
    const differencePercent = wRate !== 0 ? (difference / wRate) * 100 : 0;

    let negotiationResult: any = {
      workerId,
      originalRate: wRate,
      clientBudget: cBudget,
      negotiated: false,
    };

    if (wRate <= cBudget) {
      // Worker rate fits budget
      negotiationResult = {
        ...negotiationResult,
        negotiated: true,
        agreedPrice: wRate,
        message: `Worker's rate of ₦${wRate.toLocaleString()} fits within your budget.`,
        recommendation: "PROCEED",
      };
    } else if (differencePercent <= 15) {
      // Within 15% - slight negotiation
      const proposedPrice = Math.round((wRate + cBudget) / 2);
      negotiationResult = {
        ...negotiationResult,
        negotiated: true,
        agreedPrice: proposedPrice,
        message: `Negotiated to ₦${proposedPrice.toLocaleString()} (midpoint between worker rate and your budget).`,
        recommendation: "PROCEED",
      };
    } else if (differencePercent <= 30) {
      // 15-30% difference - significant negotiation needed
      const proposedPrice = Math.round(cBudget * 1.1);
      negotiationResult = {
        ...negotiationResult,
        negotiated: false,
        agreedPrice: proposedPrice,
        message: `Worker's rate is ${Math.round(differencePercent)}% higher. Proposed compromise: ₦${proposedPrice.toLocaleString()}.`,
        recommendation: "NEEDS_APPROVAL",
      };
    } else {
      // >30% difference - suggest finding another worker
      negotiationResult = {
        ...negotiationResult,
        negotiated: false,
        message: `Worker's rate exceeds budget by ${Math.round(differencePercent)}%. Consider other workers or increase budget.`,
        recommendation: "SUGGEST_ALTERNATIVES",
      };
    }

    return negotiationResult;
  },
});

const createBookingWithPaymentTool = tool({
  description: "Create booking and initiate Flutterwave payment (autonomous after approval)",
  inputSchema: z.object({
    workerId: z.string(),
    clientId: z.string(),
    jobTitle: z.string(),
    jobDescription: z.string(),
    category: z.string(),
    location: z.string(),
    scheduledDate: z.string(),
    agreedAmount: z.number().describe("Final agreed amount in Naira"),
  }),
  async execute({
    workerId,
    clientId,
    jobTitle,
    jobDescription,
    category,
    location,
    scheduledDate,
    agreedAmount,
  }) {
    const supabase = await createClient();

    try {
      const agreedAmountNum = toNum(agreedAmount);

      // 1. Create job
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          client_id: clientId,
          title: jobTitle,
          description: jobDescription,
          category: category,
          location_city: String(location).split(",")[0]?.trim() || null,
          location_area: String(location).split(",")[1]?.trim() || null,
          budget_min_ngn: agreedAmountNum,
          budget_max_ngn: agreedAmountNum,
          status: "assigned",
          assigned_worker_id: workerId,
          final_amount_ngn: agreedAmountNum,
        })
        .select()
        .single();

      if (jobError || !job) {
        return {
          success: false,
          message: `Failed to create job: ${jobError?.message}`,
        };
      }

      // 2. Calculate amounts (15% commission)
      const commission = Math.round(agreedAmountNum * 0.15);
      const workerAmount = agreedAmountNum - commission;

      // 3. Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          job_id: job.id,
          client_id: clientId,
          worker_id: workerId,
          scheduled_date: scheduledDate,
          amount_ngn: agreedAmountNum,
          commission_ngn: commission,
          worker_amount_ngn: workerAmount,
          status: "pending_payment",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError || !booking) {
        return {
          success: false,
          message: `Failed to create booking: ${bookingError?.message}`,
        };
      }

      // 4. Update application status to hired (best-effort)
      try {
        await supabase
          .from("applications")
          .update({ status: "hired" })
          .eq("job_id", job.id)
          .eq("worker_id", workerId);
      } catch (e) {
        // non-critical
        console.warn("Failed to update application status to hired:", e);
      }

      // 5. Create notifications
      try {
        await supabase.from("notifications").insert([
          {
            user_id: workerId,
            type: "booking_created",
            title: "New Booking - Payment Pending",
            message: `You've been hired for "${jobTitle}". Awaiting client payment confirmation.`,
            data: { booking_id: booking.id, job_id: job.id },
            read: false,
          },
        ]);
      } catch (e) {
        console.warn("Failed to insert notification:", e);
      }

      return {
        success: true,
        bookingId: booking.id,
        jobId: job.id,
        agreedAmount: agreedAmountNum,
        commission: commission,
        workerPayout: workerAmount,
        message: `Booking created! Total: ₦${agreedAmountNum.toLocaleString()} (Worker gets ₦${workerAmount.toLocaleString()} after 15% platform fee).`,
        nextStep: "INITIATE_PAYMENT",
        paymentUrl: `/client/bookings/${booking.id}/pay`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error: ${error?.message ?? String(error)}`,
      };
    }
  },
});

const checkWorkerAvailabilityTool = tool({
  description: "Check specific worker availability for a date",
  inputSchema: z.object({
    workerId: z.string(),
    date: z.string(),
  }),
  async execute({ workerId, date }) {
    const supabase = await createClient();

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("worker_id", workerId)
      .eq("scheduled_date", date)
      .in("status", ["confirmed", "in_progress"]);

    const isAvailable = !bookings || bookings.length === 0;

    return {
      available: isAvailable,
      conflictingBookings: bookings?.length || 0,
      message: isAvailable ? "Worker is available" : `Worker has ${bookings?.length} booking(s) on this date`,
    };
  },
});

const tools = {
  searchWorkers: searchWorkersTool,
  negotiatePrice: negotiatePriceTool,
  createBookingWithPayment: createBookingWithPaymentTool,
  checkWorkerAvailability: checkWorkerAvailabilityTool,
} as const;

export type AgentChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>;

/* ---------------------------
   Gemini Configuration
   --------------------------- */

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set");
}

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function extractToolCall(text: string) {
  const m = text.match(/<<TOOL_CALL>>([\s\S]*?)<<END_TOOL_CALL>>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (err) {
    return null;
  }
}

function removeToolCallBlock(text: string) {
  return text.replace(/<<TOOL_CALL>>[\s\S]*?<<END_TOOL_CALL>>/g, "").trim();
}

/* ---------------------------
   ENHANCED SYSTEM PROMPT
   --------------------------- */

const SYSTEM_PROMPT = `You are Choriad AI Agent - an autonomous booking assistant for Nigerian service providers.

YOUR COMPLETE WORKFLOW:

1️⃣ **DISCOVERY PHASE**
   - Greet client warmly
   - Ask: What service needed? Where? When? Budget range?
   - Extract: skills, location, urgency, budget

2️⃣ **SEARCH & MATCH** (Use searchWorkers tool)
   - Find TOP 3 workers based on:
     • Skill match
     • Location proximity  
     • Rating & experience
     • Budget compatibility
   - Present matches with:
     • Match score (0-100)
     • Key strengths
     • Hourly rate
     • Completed jobs
     • Verification status

3️⃣ **PRICE NEGOTIATION** (Use negotiatePrice tool)
   - Compare worker rate vs client budget
   - If gap exists:
     • <15% difference: Auto-negotiate midpoint
     • 15-30% difference: Propose compromise, need approval
     • >30% difference: Suggest alternative workers
   - If match: Proceed to booking

4️⃣ **BOOKING CREATION** (Use createBookingWithPayment tool)
   - **ONLY AFTER CLIENT EXPLICITLY APPROVES**
   - Required fields:
     • Worker ID
     • Job title & description
     • Location
     • Scheduled date/time
     • Agreed amount
   - Creates job + booking
   - Calculates: Total, 15% commission, worker payout
   - Returns payment URL

5️⃣ **PAYMENT INITIATION**
   - Direct client to: \`/client/bookings/{bookingId}/pay\`
   - Explain: "Pay ₦X to Choriad escrow"
   - Money held until job completion
   - Worker gets ₦Y after platform fee

6️⃣ **POST-BOOKING**
   - Confirm booking details
   - Set expectations:
     • Worker notified
     • Payment secured in escrow
     • Client marks job complete when done
     • Worker gets paid automatically after admin verification

🚫 **CRITICAL RULES:**
- NEVER call createBookingWithPayment without explicit client approval
- ALWAYS show TOP 3 matches first
- ALWAYS negotiate if price gap exists
- ALWAYS explain escrow & payment flow
- Present prices in Nigerian Naira (₦)
- Use professional yet friendly tone
- Reference Lagos, Abuja, Port Harcourt context

📋 **TOOL CALL FORMAT:**
<<TOOL_CALL>>{"tool":"searchWorkers","input":{...}}<<END_TOOL_CALL>>

After tool output, reason about results and guide client to next step.`;

/* ---------------------------
   POST Handler
   --------------------------- */

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let parsed: any = {};

    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch (err) {
      parsed = {};
    }

    const incomingMessages =
      parsed.messages ||
      (parsed.message ? (Array.isArray(parsed.message) ? parsed.message : [parsed.message]) : []);

    if (!incomingMessages || incomingMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = await validateUIMessages<AgentChatMessage>({
      messages: incomingMessages,
      tools,
    });

    const modelMessages = convertToModelMessages(messages);
    const conversationChunks: string[] = [`SYSTEM: ${SYSTEM_PROMPT}`];

    // Add conversation history
    for (const m of modelMessages) {
      let text = "";
      const content = (m as any).content;

      if (typeof content === "string") {
        text = content;
      } else if (Array.isArray(content)) {
        text = content
          .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
          .join("\n");
      }

      conversationChunks.push(`${(m.role ?? "user").toUpperCase()}: ${text}`);
    }

    const maxSteps = 6;
    let step = 0;
    let finalAssistantText = "";
    const lastToolOutputs: Array<{ tool: string; output: any }> = [];

    // Tool orchestration loop
    while (step < maxSteps) {
      step++;

      const promptText = conversationChunks.join("\n\n");
      const response = await genai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: promptText }] }],
      });

      const genText =
        response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

      const toolCall = extractToolCall(genText);

      if (toolCall && toolCall.tool && toolCall.input) {
        const toolName: string = toolCall.tool;
        const toolFn = (tools as any)[toolName];

        if (!toolFn) {
          conversationChunks.push(`ASSISTANT: Tool "${toolName}" not found.`);
          continue;
        }

        let toolResult;
        try {
          toolResult = await toolFn.execute(toolCall.input);
        } catch (err) {
          toolResult = {
            success: false,
            message: (err as any)?.message ?? String(err),
          };
        }

        lastToolOutputs.push({ tool: toolName, output: toolResult });
        conversationChunks.push(`TOOL_OUTPUT (${toolName}): ${JSON.stringify(toolResult)}`);
        continue;
      } else {
        finalAssistantText = removeToolCallBlock(genText);
        break;
      }
    }

    // Build response
    const parts: any[] = [];

    if (finalAssistantText?.trim()) {
      parts.push({ type: "text", text: finalAssistantText });
    }

    for (const t of lastToolOutputs) {
      parts.push({
        type: `tool-${t.tool}`,
        state: "output-available",
        output: t.output,
      });
    }

    if (parts.length === 0) {
      parts.push({
        type: "text",
        text: "I'm having trouble processing that. Could you rephrase?",
      });
    }

    const assistantUIMessage: AgentChatMessage = {
      id: "assistant-" + Date.now(),
      role: "assistant",
      parts,
    };

    return new Response(JSON.stringify({ messages: [assistantUIMessage] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Agent error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
