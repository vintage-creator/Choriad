import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/client/dashboard-header"
import { JobDetails } from "@/components/client/job-details"

interface JobPageProps {
  params: Promise<{ id: string }>
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard")
  }

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("client_id", user.id).single()

  if (!job) {
    notFound()
  }

  // Get assigned worker if any
  let worker = null
  if (job.assigned_worker_id) {
    const { data: workerData } = await supabase
      .from("workers")
      .select("*, profiles(*)")
      .eq("id", job.assigned_worker_id)
      .single()
    worker = workerData
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="container py-8 max-w-4xl">
        <JobDetails job={job} worker={worker} />
      </main>
    </div>
  )
}
