// api/agent/chat/route.ts
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

/**
 * Helper: normalize location for flexible matching
 */
function normalizeLocation(loc: string): string {
  return String(loc || "")
    .toLowerCase()
    .trim();
}

/**
 * Helper: normalize and extract skill keywords
 */
function normalizeSkills(skills: string | string[]): string[] {
  // Handle case where Gemini passes a string instead of array
  let skillsArray: string[];

  if (typeof skills === "string") {
    skillsArray = [skills];
  } else if (Array.isArray(skills)) {
    skillsArray = skills;
  } else {
    console.warn("Invalid skills type:", typeof skills);
    return [];
  }

  const normalized: string[] = [];
  for (const skill of skillsArray) {
    const s = String(skill || "")
      .toLowerCase()
      .trim();
    if (!s) continue;

    // Add synonyms for common services
    if (
      s.includes("personal shopper") ||
      s.includes("grocery") ||
      s.includes("shopping")
    ) {
      normalized.push(
        "personal shopper",
        "grocery shopping",
        "shopping assistant",
        "errand runner"
      );
    } else {
      normalized.push(s);
    }
  }
  return [...new Set(normalized)];
}

/* ---------------------------
   ENHANCED TOOLS with Better Error Handling
   --------------------------- */

const searchWorkersSchema = z.object({
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  skill: z.string().optional(),
  service: z.string().optional(),
  location: z.string().describe("Job location"),
  maxBudget: z.number().optional().describe("Maximum budget in Naira"),
  budget_max: z.number().optional(), // Alternative parameter name
  urgency: z.enum(["today", "this_week", "flexible"]).optional(),
});

const negotiatePriceSchema = z.object({
  workerId: z.string(),
  workerRate: z.number().describe("Worker's hourly/fixed rate (0 if not set)"),
  clientBudget: z.number().describe("Client's maximum budget"),
  jobComplexity: z.enum(["simple", "moderate", "complex"]).optional(),
});

const createBookingRequestSchema = z.object({
  workerId: z.string(),
  clientId: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  category: z.string(),
  location: z.string(),
  scheduledDate: z.string(),
  proposedAmount: z.number().describe("Client's proposed budget"),
  workerRate: z
    .number()
    .optional()
    .describe("Worker's hourly rate (0 if flexible)"),
  negotiationNote: z.string().optional(),
  urgency: z.enum(["today", "this_week", "flexible"]).optional(),
});

const checkWorkerAvailabilitySchema = z.object({
  workerId: z.string(),
  date: z.string(),
});

const acceptCounterOfferSchema = z.object({
  bookingRequestId: z.string(),
  clientId: z.string(),
});

const tools = {
  searchWorkers: {
    description:
      "Search for available workers and rank them by match quality (top 3)",
    schema: searchWorkersSchema,
    execute: async (input: any) => {
      const supabase = await createClient();

      try {
        let skillsParam = input.skills || input.skill || input.service;

        // If skills is a string, convert it to array
        if (typeof skillsParam === "string") {
          skillsParam = [skillsParam];
        }

        // Ensure skills is an array
        if (!Array.isArray(skillsParam)) {
          skillsParam = [];
        }

        // Handle budget parameter variations
        const maxBudget = input.maxBudget || input.budget_max;

        // Normalize location for flexible matching
        const normalizedLocation = normalizeLocation(input.location);
        const normalizedSkills = normalizeSkills(skillsParam || []);

        // Query workers - check BOTH location AND location_city fields
        const { data: workers, error } = await supabase
          .from("workers")
          .select(
            `
            *,
            profiles!workers_id_fkey(full_name, avatar_url, email)
          `
          )
          .eq("availability_status", "available")
          .order("rating", { ascending: false })
          .limit(50); // Get more workers for better matching

        if (error) {
          console.error("Worker query error:", error);
          return {
            success: false,
            workers: [],
            message: `Database error: ${error.message}`,
          };
        }

        if (!workers || workers.length === 0) {
          return {
            success: false,
            workers: [],
            message:
              "No available workers found in the system. Please try again later.",
          };
        }

        // AI-powered ranking with flexible matching
        const matchedWorkers = workers
          .map((worker: any) => {
            let matchScore = 0;

            // Skill match (40 points) - More flexible matching
            const workerSkills: string[] = Array.isArray(worker.skills)
              ? worker.skills.map((s: string) =>
                  String(s || "")
                    .toLowerCase()
                    .trim()
                )
              : [];

            const requestedSkills = normalizedSkills;

            if (requestedSkills.length > 0 && workerSkills.length > 0) {
              let skillMatchCount = 0;

              for (const reqSkill of requestedSkills) {
                const hasMatch = workerSkills.some((wSkill: string) => {
                  // Fuzzy matching - check if either contains the other
                  return wSkill.includes(reqSkill) || reqSkill.includes(wSkill);
                });

                if (hasMatch) skillMatchCount++;
              }

              matchScore += (skillMatchCount / requestedSkills.length) * 40;
            }

            // Location match (30 points)
            const workerCity = normalizeLocation(worker.location_city || "");
            const workerArea = normalizeLocation(worker.location_area || "");
            const workerFullLocation = `${workerArea} ${workerCity}`.trim();

            if (workerArea && normalizedLocation.includes(workerArea)) {
              matchScore += 30;
            } else if (workerCity && normalizedLocation.includes(workerCity)) {
              matchScore += 15;
            } else if (
              workerFullLocation &&
              normalizedLocation.includes(workerFullLocation)
            ) {
              matchScore += 30;
            } else if (workerArea && workerCity) {
              const locationKeywords = normalizedLocation
                .split(/[\s,]+/)
                .filter(Boolean);
              const workerKeywords = [workerArea, workerCity];

              const overlap = locationKeywords.filter((kw) =>
                workerKeywords.some((wk) => wk.includes(kw) || kw.includes(wk))
              );

              if (overlap.length > 0) {
                matchScore += Math.min(overlap.length * 15, 25);
              }
            }

            // Budget fit (15 points)
            const hourlyRate = toNum(
              worker.hourly_rate_ngn || worker.hourly_rate
            );
            const maxBudgetNum = toNum(maxBudget);

            if (maxBudgetNum > 0 && hourlyRate > 0) {
              if (hourlyRate <= maxBudgetNum) {
                matchScore += 15;
              } else if (hourlyRate <= maxBudgetNum * 1.2) {
                matchScore += 8;
              }
            } else if (hourlyRate === 0 && maxBudgetNum > 0) {
              // Worker has no rate, give them benefit of doubt
              matchScore += 10;
            }

            // Rating (10 points)
            const ratingNum = toNum(worker.rating);
            if (ratingNum === 0) {
              matchScore += 5; // New workers get neutral score
            } else {
              matchScore += (ratingNum / 5) * 10;
            }

            // Experience (5 points)
            const completedJobsNum = toNum(worker.completed_jobs);
            matchScore += Math.min(completedJobsNum / 10, 1) * 5;

            const profile = Array.isArray(worker.profiles)
              ? worker.profiles[0]
              : worker.profiles;

            return {
              id: worker.id,
              user_id: worker.user_id || worker.id,
              name: profile?.full_name || "Worker",
              bio: worker.bio || null,
              profilePicture:
                Array.isArray(worker.profile_pictures_urls) &&
                worker.profile_pictures_urls.length > 0
                  ? worker.profile_pictures_urls[0]
                  : profile?.avatar_url || null,
              skills: workerSkills,
              rating: ratingNum || 0,
              totalReviews: toNum(worker.total_reviews) || 0,
              hourlyRate: hourlyRate || 0,
              completedJobs: completedJobsNum || 0,
              location:
                workerArea && workerCity
                  ? `${workerArea}, ${workerCity}`
                  : workerArea || workerCity || null,
              locationArea: worker.location_area || null,
              locationCity: worker.location_city || null,
              verified: worker.verification_status === "verified",
              matchScore: Math.round(matchScore),
              availability: worker.available_days || [],
              isNewWorker: ratingNum === 0 && completedJobsNum === 0,
            };
          })
          .filter((w) => w.matchScore > 5)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);

        if (matchedWorkers.length === 0) {
          return {
            success: false,
            workers: [],
            message: `Found ${workers.length} available workers but none match your requirements. Try broadening your search.`,
          };
        }

        return {
          success: true,
          workers: matchedWorkers,
          message: `Found ${matchedWorkers.length} top match${
            matchedWorkers.length > 1 ? "es" : ""
          } for your requirements`,
        };
      } catch (error: any) {
        console.error("Search workers error:", error);
        return {
          success: false,
          workers: [],
          message: `Error searching for workers: ${
            error?.message || "Unknown error"
          }`,
        };
      }
    },
  },

  negotiatePrice: {
    description:
      "Negotiate price with a worker based on client budget and worker rate. If worker has no rate (0), use client budget.",
    schema: negotiatePriceSchema,
    execute: async (input: any) => {
      const wRate = toNum(input.workerRate);
      const cBudget = toNum(input.clientBudget);

      let negotiationResult: any = {
        workerId: input.workerId,
        originalRate: wRate,
        clientBudget: cBudget,
        negotiated: false,
      };

      // If worker has no rate (0), they're flexible - use client's budget
      if (wRate === 0 || wRate === null) {
        negotiationResult = {
          ...negotiationResult,
          negotiated: true,
          agreedPrice: cBudget,
          message: `Worker's rate is flexible. Agreed price: ₦${cBudget.toLocaleString()} (your budget).`,
          recommendation: "PROCEED",
          isFlexibleRate: true,
        };
        return negotiationResult;
      }

      // If worker has a set rate, negotiate normally
      const difference = wRate - cBudget;
      const differencePercent = wRate !== 0 ? (difference / wRate) * 100 : 0;

      if (wRate <= cBudget) {
        negotiationResult = {
          ...negotiationResult,
          negotiated: true,
          agreedPrice: wRate,
          message: `Worker's rate of ₦${wRate.toLocaleString()} fits within your budget.`,
          recommendation: "PROCEED",
        };
      } else if (differencePercent <= 15) {
        const proposedPrice = Math.round((wRate + cBudget) / 2);
        negotiationResult = {
          ...negotiationResult,
          negotiated: true,
          agreedPrice: proposedPrice,
          message: `Negotiated to ₦${proposedPrice.toLocaleString()} (midpoint).`,
          recommendation: "PROCEED",
        };
      } else if (differencePercent <= 30) {
        const proposedPrice = Math.round(cBudget * 1.1);
        negotiationResult = {
          ...negotiationResult,
          negotiated: false,
          agreedPrice: proposedPrice,
          message: `Worker's rate is ${Math.round(
            differencePercent
          )}% higher. Proposed: ₦${proposedPrice.toLocaleString()}.`,
          recommendation: "NEEDS_APPROVAL",
        };
      } else {
        negotiationResult = {
          ...negotiationResult,
          negotiated: false,
          message: `Worker's rate exceeds budget by ${Math.round(
            differencePercent
          )}%. Consider other workers.`,
          recommendation: "SUGGEST_ALTERNATIVES",
        };
      }

      return negotiationResult;
    },
  },

  createBookingRequest: {
    description:
      "Send a booking request to a worker. Worker must approve before booking is confirmed.",
    schema: createBookingRequestSchema,
    execute: async (input: any) => {
      const supabase = await createClient();

      try {
        const proposedAmountNum = toNum(input.proposedAmount);
        const workerRateNum = toNum(input.workerRate);
        const urgency = input.urgency || "flexible";

        // Parse location
        const locationParts = String(input.location)
          .split(",")
          .map((s) => s.trim());
        const location_area =
          locationParts.length > 1 ? locationParts[0] : locationParts[0];
        const location_city =
          locationParts.length > 1 ? locationParts[1] : "Lagos";

        let expiryHours = 24; // Default
        if (urgency === "today") {
          expiryHours = 6; // 6 hours for urgent jobs
        } else if (urgency === "this_week") {
          expiryHours = 12; // 12 hours for this week
        }

        const expiresAt = new Date(
          Date.now() + expiryHours * 60 * 60 * 1000
        ).toISOString();

        // 1. Create job with VALID status
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .insert({
            client_id: input.clientId,
            title: input.jobTitle,
            description: input.jobDescription,
            category: input.category || "errands_delivery",
            location_city: location_city,
            location_area: location_area,
            budget_min_ngn: proposedAmountNum,
            budget_max_ngn: proposedAmountNum,
            status: "assigned",
            assigned_worker_id: input.workerId,
            urgency: urgency,
          })
          .select()
          .single();

        if (jobError || !job) {
          console.error("Job creation error:", jobError);
          return {
            success: false,
            message: `Failed to create booking request: ${
              jobError?.message || "Unknown error"
            }`,
          };
        }

        // 2. Create booking request
        const { data: bookingRequest, error: bookingError } = await supabase
          .from("booking_requests")
          .insert({
            job_id: job.id,
            client_id: input.clientId,
            worker_id: input.workerId,
            scheduled_date: input.scheduledDate,
            proposed_amount_ngn: proposedAmountNum,
            worker_rate_ngn: workerRateNum,
            negotiation_note: input.negotiationNote || null,
            status: "pending",
            expires_at: expiresAt,
            metadata: {
              auto_continue: true,
              job_title: input.jobTitle,
              client_id: input.clientId,
            },
          })
          .select()
          .single();

        if (bookingError || !bookingRequest) {
          console.error("Booking request creation error:", bookingError);
          return {
            success: false,
            message: `Failed to create booking request: ${
              bookingError?.message || "Unknown error"
            }`,
          };
        }

        // 3. Create notification for worker with urgency flag
        try {
          await supabase.from("notifications").insert({
            user_id: input.workerId,
            type: "booking_request",
            title:
              urgency === "today"
                ? "🔥 URGENT Booking Request"
                : "New Booking Request",
            message: `${
              input.jobTitle
            } - Client offers ₦${proposedAmountNum.toLocaleString()}. ${
              workerRateNum > 0 && workerRateNum !== proposedAmountNum
                ? `Your rate: ₦${workerRateNum.toLocaleString()}.`
                : ""
            } ${
              urgency === "today"
                ? "Respond within 6 hours!"
                : "Review and respond."
            }`,
            data: {
              booking_request_id: bookingRequest.id,
              job_id: job.id,
              proposed_amount: proposedAmountNum,
              worker_rate: workerRateNum,
              urgency: urgency,
              expires_in_hours: expiryHours,
            },
            read: false,
          });
        } catch (e) {
          console.warn("Failed to create notification:", e);
        }

        const expiryMessage =
          urgency === "today"
            ? "⚡ Urgent: Worker has 6 hours to respond."
            : urgency === "this_week"
            ? "Worker has 12 hours to respond."
            : "Worker has 24 hours to respond.";

        return {
          success: true,
          bookingRequestId: bookingRequest.id,
          jobId: job.id,
          proposedAmount: proposedAmountNum,
          workerRate: workerRateNum,
          expiresInHours: expiryHours,
          message: `Booking request sent! ${expiryMessage} ${
            workerRateNum > 0 && workerRateNum !== proposedAmountNum
              ? "They may accept, counter, or negotiate the price."
              : "Awaiting their confirmation."
          }`,
          nextStep: "AWAITING_WORKER_RESPONSE",
          expiresAt: expiresAt,
        };
      } catch (error: any) {
        console.error("Booking request creation exception:", error);
        return {
          success: false,
          message: `Error: ${error?.message ?? String(error)}`,
        };
      }
    },
  },

  acceptCounterOffer: {
    description:
      "Accept a worker's counter-offer and create booking for payment",
    schema: acceptCounterOfferSchema,
    execute: async (input: any) => {
      const supabase = await createClient();

      try {
        // Get booking request details
        const { data: request, error: fetchError } = await supabase
          .from("booking_requests")
          .select("*, jobs(*)")
          .eq("id", input.bookingRequestId)
          .eq("client_id", input.clientId)
          .single();

        if (fetchError || !request) {
          return {
            success: false,
            message: "Booking request not found",
          };
        }

        if (request.status !== "countered") {
          return {
            success: false,
            message: "No counter-offer to accept",
          };
        }

        const counterAmount = request.counter_offer_ngn;

        // Update booking request status
        await supabase
          .from("booking_requests")
          .update({
            status: "client_accepted",
            proposed_amount_ngn: counterAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.bookingRequestId);

        // Notify worker
        await supabase.from("notifications").insert({
          user_id: request.worker_id,
          type: "booking_confirmed",
          title: "Counter-Offer Accepted!",
          message: `Client accepted your counter-offer of ₦${counterAmount.toLocaleString()}. Awaiting payment.`,
          data: {
            booking_request_id: input.bookingRequestId,
            job_id: request.job_id,
            amount: counterAmount,
          },
          read: false,
        });

        return {
          success: true,
          bookingRequestId: input.bookingRequestId,
          agreedAmount: counterAmount,
          message: `Counter-offer accepted! Agreed price: ₦${counterAmount.toLocaleString()}`,
          nextStep: "PROCEED_TO_PAYMENT",
          paymentUrl: `/client/bookings/${input.bookingRequestId}/pay`,
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Error: ${error?.message || "Unknown error"}`,
        };
      }
    },
  },

  checkWorkerAvailability: {
    description: "Check worker availability for a date",
    schema: checkWorkerAvailabilitySchema,
    execute: async (input: any) => {
      const supabase = await createClient();

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("worker_id", input.workerId)
        .eq("scheduled_date", input.date)
        .in("status", ["confirmed", "in_progress"]);

      const isAvailable = !bookings || bookings.length === 0;

      return {
        available: isAvailable,
        conflictingBookings: bookings?.length || 0,
        message: isAvailable
          ? "Worker is available"
          : `Worker has ${bookings?.length} booking(s) on this date`,
      };
    },
  },
} as const;

/* ---------------------------
   Gemini Configuration
   --------------------------- */

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
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
   SYSTEM PROMPT - Force AI to use ONLY tool data
   --------------------------- */

const SYSTEM_PROMPT = `You are Choriad AI Agent - an autonomous booking assistant for Nigerian service providers.

**CRITICAL AUTHENTICATION RULE:** 
The authenticated client's ID will be provided as AUTHENTICATED_CLIENT_ID in the conversation.
You MUST use this EXACT UUID when calling createBookingRequest.
NEVER make up client IDs like "client123" or generate fake UUIDs.

YOUR COMPLETE WORKFLOW:

1️⃣ **DISCOVERY PHASE**
   - Extract: service type, location, date/time, budget, urgency
   - Be flexible with skill names (grocery = shopping = personal shopper)
   - Identify urgency: "today"/"urgent" → today, "this week"/"soon" → this_week, otherwise → flexible

2️⃣ **SEARCH & MATCH** (Use searchWorkers tool)
   - Call: <<TOOL_CALL>>{"tool":"searchWorkers","input":{"skills":["service name"],"location":"area","maxBudget":amount}}<<END_TOOL_CALL>>
   - **CRITICAL**: Present workers EXACTLY as returned by tool
   - Use the EXACT worker ID from tool output (UUID format)
   - NEVER invent or modify worker data

3️⃣ **SMART PRICE ANALYSIS** (Use negotiatePrice tool)
   - If hourlyRate = 0: Worker is flexible, client's budget is reasonable
   - If hourlyRate > 0: Analyze intelligently
   - Call with context: <<TOOL_CALL>>{"tool":"negotiatePrice","input":{"workerId":"UUID","workerRate":30000,"clientBudget":25000,"jobComplexity":"simple","workerExperience":5,"urgency":"today"}}<<END_TOOL_CALL>>
   - **CRITICAL RULES**:
     • If gap >30% and job is simple → WARN client, suggest alternatives
     • If gap 15-30% → Propose smart compromise (NOT always midpoint)
     • Always ASK client approval before proceeding
     • Example: "Worker's rate is ₦40k but budget is ₦25k (60% higher) for grocery shopping. This seems inflated. Shall I find alternatives?"
   - NEVER create booking without explicit client approval

4️⃣ **SEND BOOKING REQUEST** (ONLY after client approves)
   - Use EXACT worker ID from search results
   - Use AUTHENTICATED_CLIENT_ID from conversation context
   - Include urgency parameter: <<TOOL_CALL>>{"tool":"createBookingRequest","input":{"workerId":"UUID","clientId":"AUTHENTICATED_CLIENT_ID","jobTitle":"...","jobDescription":"...","category":"errands_delivery","location":"ajah, lagos","scheduledDate":"2026-01-11","proposedAmount":25000,"workerRate":0,"urgency":"today","negotiationNote":"optional"}}<<END_TOOL_CALL>>
   - Worker gets notification and must respond
   - **CRITICAL**: The clientId MUST be the AUTHENTICATED_CLIENT_ID 

 5️⃣ **SET CORRECT EXPIRY EXPECTATIONS**
    - If urgency="today": Tell client "Worker has 6 hours to respond"
    - If urgency="this_week": Tell client "Worker has 12 hours to respond"  
    - If urgency="flexible": Tell client "Worker has 24 hours to respond"
6️⃣ **WORKER RESPONSE HANDLING**
   - If worker ACCEPTS → Automatically notify client and provide payment link
   - If worker COUNTERS → Present counter-offer details and ask client if they want to:
     • Accept counter-offer: Call acceptCounterOffer tool
     • Decline: Suggest showing alternative workers
   - If worker REJECTS → Suggest alternative workers from original search
   
   When client wants to accept counter-offer:
   - Call: <<TOOL_CALL>>{"tool":"acceptCounterOffer","input":{"bookingRequestId":"UUID","clientId":"AUTHENTICATED_CLIENT_ID"}}<<END_TOOL_CALL>>
   - Then direct to payment page

7️⃣ **PAYMENT** (Only after worker accepts)
   - Direct to: /client/bookings/{bookingId}/pay
   - Explain escrow process

**NEGOTIATION INTELLIGENCE:**
   - Simple job + 60% markup = Gaming detected → Suggest alternatives
   - Complex job + experienced worker + 20% gap = Reasonable compromise
   - Always consider: job complexity, urgency, worker experience
   - Get client approval for ANY negotiated price

**TOOL CALL FORMAT:**
<<TOOL_CALL>>{"tool":"toolName","input":{...}}<<END_TOOL_CALL>>

After tool output, present results verbatim. DO NOT modify worker data.`;

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
      (parsed.message
        ? Array.isArray(parsed.message)
          ? parsed.message
          : [parsed.message]
        : []);

    if (!incomingMessages || incomingMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // CRITICAL: Extract authenticated user ID from request
    const userId = parsed.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID required. Please log in." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const messages = incomingMessages.map((msg: any) => ({
      id: msg.id || `msg-${Date.now()}-${Math.random()}`,
      role: msg.role || "user",
      parts: msg.parts || [{ type: "text", text: msg.content || "" }],
      content:
        msg.content ||
        (msg.parts && msg.parts.find((p: any) => p.type === "text")?.text) ||
        "",
      userId: userId,
    }));

    const conversationChunks: string[] = [`SYSTEM: ${SYSTEM_PROMPT}`];

    // CRITICAL: Include authenticated client ID in context
    conversationChunks.push(`AUTHENTICATED_CLIENT_ID: ${userId}`);
    conversationChunks.push(
      `IMPORTANT: When calling createBookingRequest, use clientId="${userId}" (this is the authenticated user's UUID).`
    );

    const recentMessages = messages.slice(-6);

    for (const msg of recentMessages) {
      let text = "";

      if (msg.parts && Array.isArray(msg.parts)) {
        text = msg.parts
          .map((part: any) => {
            if (part.type === "text" && part.text) return part.text;
            if (part.type?.startsWith("tool-")) {
              // Include full tool output in context
              return `[Tool ${part.type.replace(
                "tool-",
                ""
              )} output: ${JSON.stringify(part.output)}]`;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      } else if (msg.content) {
        text = msg.content;
      }

      if (text.trim()) {
        if (text.length > 3000) {
          text = text.substring(0, 3000) + "... [truncated]";
        }
        conversationChunks.push(`${msg.role.toUpperCase()}: ${text}`);
      }
    }

    const maxSteps = 8;
    let step = 0;
    let finalAssistantText = "";
    const lastToolOutputs: Array<{ tool: string; output: any }> = [];

    while (step < maxSteps) {
      step++;

      const promptText = conversationChunks.join("\n\n");

      const response = await genai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          maxOutputTokens: 2048,
          temperature: 0.3,
        },
      });

      const genText =
        response?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join("") ?? "";

      const toolCall = extractToolCall(genText);

      if (toolCall && toolCall.tool && toolCall.input) {
        const toolName: string = toolCall.tool;
        const toolFn = (tools as any)[toolName]?.execute;

        if (!toolFn) {
          conversationChunks.push(`ASSISTANT: Tool "${toolName}" not found.`);
          continue;
        }

        // Inject userId for createBookingRequest if not provided
        if (toolName === "createBookingRequest") {
          if (!toolCall.input.clientId) {
            toolCall.input.clientId = userId;
          }
          // Validate it's a UUID
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(toolCall.input.clientId)) {
            console.error(
              `Invalid client ID format: ${toolCall.input.clientId}`
            );
            conversationChunks.push(
              `ERROR: Invalid client ID format. Using authenticated user ID: ${userId}`
            );
            toolCall.input.clientId = userId;
          }
        }

        let toolResult;
        try {
          toolResult = await toolFn(toolCall.input);
        } catch (err) {
          console.error(`Tool execution error:`, err);
          toolResult = {
            success: false,
            message: (err as any)?.message ?? String(err),
          };
        }

        lastToolOutputs.push({ tool: toolName, output: toolResult });

        // Add full tool output to conversation
        conversationChunks.push(
          `TOOL_OUTPUT (${toolName}): ${JSON.stringify(toolResult)}`
        );

        // Force AI to reference tool data
        conversationChunks.push(
          `SYSTEM REMINDER: You MUST use the EXACT data from the tool output above. DO NOT invent different worker IDs, names, scores, or job counts.`
        );
        continue;
      } else {
        finalAssistantText = removeToolCallBlock(genText);
        break;
      }
    }

    const parts: any[] = [];

    if (finalAssistantText?.trim()) {
      parts.push({ type: "text", text: finalAssistantText });
    }

    for (const t of lastToolOutputs) {
      parts.push({
        type: `tool-${t.tool}`,
        toolCallId: `${t.tool}-${Date.now()}`,
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

    const assistantUIMessage = {
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
    return new Response(
      JSON.stringify({
        error: err?.message ?? "Internal error",
        details:
          process.env.NODE_ENV === "development" ? err?.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
