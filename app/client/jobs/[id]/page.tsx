// app/client/jobs/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { JobDetails } from "@/components/client/job-details";
import { Footer } from "@/components/landing/footer";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // -------------------------
  // Auth
  // -------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard");
  }

  // -------------------------
  // Job
  // -------------------------
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!job) notFound();

  // -------------------------
  // Job Metrics
  // -------------------------
  const metrics: {
    applicants?: number;
    completionProgress?: number;
  } = {};

  // Applicants count
  try {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact" })
      .eq("job_id", id);

    metrics.applicants = count ?? 0;
  } catch {
    metrics.applicants = 0;
  }

  // Completion progress (derived from status)
  switch (job.status) {
    case "completed":
      metrics.completionProgress = 100;
      break;
    case "in_progress":
      metrics.completionProgress = 50;
      break;
    case "assigned":
      metrics.completionProgress = 25;
      break;
    default:
      metrics.completionProgress = 0;
  }

  // -------------------------
  // Worker + Stats
  // -------------------------
  let worker: any = null;

  if (job.assigned_worker_id) {
    const { data: workerData } = await supabase
      .from("workers")
      .select("*, profiles(*)")
      .eq("id", job.assigned_worker_id)
      .single();

    if (workerData) {
      // Completed jobs
      const { count: completedJobs } = await supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .eq("assigned_worker_id", job.assigned_worker_id)
        .eq("status", "completed");

      // Reviews + average rating
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("worker_id", job.assigned_worker_id);

      let avgRating = 0;

      if (reviews && reviews.length > 0) {
        avgRating =
          reviews.reduce(
            (sum, r) => sum + Number(r.rating || 0),
            0
          ) / reviews.length;
      }

      worker = {
        ...workerData,
        completed_jobs: completedJobs ?? 0,
        total_reviews: reviews?.length ?? 0,
        rating: Number(avgRating.toFixed(1)),
      };
    }
  }

  const jobWithMetrics = { ...job, metrics };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <JobDetails job={jobWithMetrics as any} worker={worker} />
      </main>
      <Footer />
    </div>
  );
}
