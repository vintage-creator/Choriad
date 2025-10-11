import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { workerIds } = await request.json()

    const supabase = await createServerClient()

    const { data: workers } = await supabase
      .from("workers")
      .select(
        `
        *,
        profile:profiles(*)
      `,
      )
      .in("user_id", workerIds)

    return NextResponse.json({ workers: workers || [] })
  } catch (error) {
    console.error("[v0] Error fetching worker details:", error)
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
  }
}
