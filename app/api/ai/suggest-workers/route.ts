// api/ai/suggest-workers/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set — set GEMINI_API_KEY in your environment.");
}

const genai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { jobDescription, category, location, budget } = await request.json();

    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: GEMINI_API_KEY not set" },
        { status: 500 }
      );
    }

    const prompt = `You are a helpful assistant for Choriad, a service provider platform in Nigeria.

A client is posting a new job with these details:
- Category: ${category}
- Location: ${location}
- Budget: ₦${budget}
- Description: ${jobDescription}

Provide helpful suggestions in 3-4 sentences:
1. What to look for in a service provider for this type of job
2. Typical pricing expectations in Nigerian cities
3. Any important questions to ask potential workers
4. Tips for a successful booking

Keep it concise, practical, and specific to the Nigerian context.`;

    // Call Gemini via the SDK (non-streaming)
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      // generationConfig: { temperature: 0.2, maxOutputTokens: 350 }, // optional tuning
    });

    // Parse returned text (SDK response shape)
    const suggestions =
      response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p === "string" ? p : p?.text ?? ""))
        .join("") ?? "";

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[v0] AI suggestion error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
