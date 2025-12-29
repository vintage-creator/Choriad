// app/worker/jobs/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header"
import { AvailableJobs } from "@/components/worker/available-jobs"
import { JobSearch } from "@/components/worker/job-search"
import { Footer } from "@/components/landing/footer"

export default async function WorkerJobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.user_type !== "worker") {
    redirect("/client/dashboard")
  }

  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!worker) {
    redirect("/worker/setup")
  }

  const { data: jobsData, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      category,
      location_city,
      location_area,
      location_address,
      budget_min_ngn,
      budget_max_ngn,
      urgency,
      status,
      created_at,
      client:profiles ( id, full_name, avatar_url ),
      bookings ( id, status, worker_id )
    `)
    .eq("status", "open")
    .eq("location_city", worker.location_city)
    .order("created_at", { ascending: false })
    .limit(50)

  if (jobsError) {
    // Log server-side; you can also surface a user-friendly message
    console.error("Failed to fetch jobs:", jobsError)
  }

  const jobs = Array.isArray(jobsData) ? jobsData : []

  // Get all cities with available jobs
  const { data: citiesWithJobs } = await supabase
    .from("jobs")
    .select("location_city")
    .eq("status", "open")
    .not("location_city", "is", null)

  const uniqueCities = Array.from(
    new Set(citiesWithJobs?.map((j: any) => j.location_city).filter(Boolean))
  ) as string[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Available Jobs
              </h1>
              <p className="text-gray-600">
                Find jobs that match your skills and location
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {jobs.length || 0} jobs available in {worker.location_city}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Filters & Search */}
          <JobSearch
  defaultCity={worker.location_city}
  cities={uniqueCities}
  workerSkills={worker.skills || []}
  matchedJobsCount={jobs.length}
/>

          {/* Right Column - Job Listings */}
          <div className="lg:col-span-3">
            <AvailableJobs
              jobs={jobs}
              workerSkills={worker.skills || []}
              showEmptyState={true}
              workerCity={worker.location_city}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
