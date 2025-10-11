import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIMatchedWorkers } from "@/components/client/ai-matched-workers"

export default async function MatchWorkersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("client_id", user.id).single()

  if (!job || job.status !== "open") {
    redirect("/client/dashboard")
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Find the Perfect Match</h1>
        <p className="text-muted-foreground mt-2">AI-powered recommendations for: {job.title}</p>
      </div>

      <AIMatchedWorkers jobId={id} />
    </div>
  )
}
