// api/ai/match-workers/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set — set GEMINI_API_KEY in your environment.");
}

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/* Schema */
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
});

function extractJson(text: string): string | null {
  // Try to find a JSON object or array in the response
  const objMatch = text.match(/(\{[\s\S]*\})/);
  if (objMatch) return objMatch[1];

  const arrMatch = text.match(/(\[[\s\S]*\])/);
  if (arrMatch) return arrMatch[1];

  return null;
}

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();

    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get job details
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
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
      .gte("rating", 3.0);

    if (!workers || workers.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build a clear, strict prompt asking for JSON-only output
    const workersList = workers
      .map((w: any, i: number) => {
        const skills = Array.isArray(w.skills) ? w.skills.join(", ") : (w.skills || "");
        const years = w.years_of_experience ?? "N/A";
        const rating = w.rating ?? "N/A";
        const reviews = w.total_reviews ?? 0;
        const hourly = w.hourly_rate_ngn ?? w.hourly_rate ?? 0;
        const bio = w.bio ?? "";
        const verification = w.verification_status ?? "unknown";
        const userId = w.user_id ?? w.id ?? w.worker_id ?? "unknown";

        return `${i + 1}. workerId: ${userId}
   name: ${w.profile?.full_name ?? "Unknown"}
   skills: ${skills}
   experience: ${years}
   rating: ${rating}
   reviews: ${reviews}
   hourlyRate: ₦${hourly}
   completedJobs: ${w.completed_jobs ?? 0}
   bio: ${bio}
   verification: ${verification}
`;
      })
      .join("\n");

    const prompt = `You are an AI matching agent for Choriad (Nigeria). 
Given the JOB and AVAILABLE WORKERS below, return a JSON object EXACTLY matching this zod schema:

{
  "matches": [
    {
      "workerId": "string",
      "score": 0-100,
      "reasoning": "string",
      "strengths": ["string", ...],
      "considerations": ["string", ...]
    }
  ]
}

Respond with ONLY the JSON object (no extra commentary). Return the top 5 matches ordered by score (highest first).

JOB:
- title: ${job.title}
- description: ${job.description}
- category: ${job.category}
- location: ${job.location_city}, ${job.location_area ?? "N/A"}
- budget min: ₦${job.budget_min_ngn ?? 0}
- budget max: ₦${job.budget_max_ngn ?? 0}
- urgency: ${job.urgency ?? "normal"}

AVAILABLE WORKERS:
${workersList}

Ranking criteria (in order of importance):
1. Skill match with job category and description
2. Experience & completed jobs
3. Rating & reviews
4. Hourly rate vs budget
5. Verification status
6. Availability & urgency match

Make scores integers 0–100. For each match produce 2-3 strengths and 1-2 considerations.

IMPORTANT: output valid JSON that matches the schema exactly.`;

    // Call Gemini
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      // optional: generationConfig: { temperature: 0.0, maxOutputTokens: 1200 },
    });

    const text =
      response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p === "string" ? p : p?.text ?? ""))
        .join("") ?? "";

    const jsonText = extractJson(text);

    if (!jsonText) {
      console.error("No JSON found in model output:", text);
      return NextResponse.json(
        { error: "Model output did not contain JSON", raw: text },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error("Failed to parse JSON from model:", err, jsonText);
      return NextResponse.json({ error: "Failed to parse JSON from model output", raw: text }, { status: 502 });
    }

    // Validate with zod
    try {
      const validated = WorkerMatchSchema.parse(parsed);
      // success
      return NextResponse.json(validated);
    } catch (zerr) {
      console.error("Zod validation failed:", zerr);
      return NextResponse.json(
        { error: "Model returned JSON that does not match schema", details: (zerr as any).issues ?? zerr, raw: parsed },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[v0] AI matching error:", error);
    return NextResponse.json({ error: "Failed to match workers" }, { status: 500 });
  }
}
