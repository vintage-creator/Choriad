import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { jobDescription, category, location, budget } = await request.json()

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use AI to provide suggestions and tips
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a helpful assistant for Choraid, a service provider platform in Nigeria.

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

Keep it concise, practical, and specific to the Nigerian context.`,
    })

    return NextResponse.json({ suggestions: text })
  } catch (error) {
    console.error("[v0] AI suggestion error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
