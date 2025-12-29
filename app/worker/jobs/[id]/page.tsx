// app/worker/jobs/[id]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { JobDetailView } from "@/components/worker/job-detail-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkerJobDetailPage({ params }: PageProps) {
  // await params per Next.js requirement
  const { id: jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get worker profile
  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!worker) redirect("/worker/setup");

  // Get worker profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get job details
  const { data: job } = await supabase
    .from("jobs")
    .select(`
      *,
      client:profiles!jobs_client_id_fkey(
        id,
        full_name,
        avatar_url,
        phone,
        email,
        created_at
      )
    `)
    .eq("id", jobId)
    .eq("status", "open")
    .single();

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <WorkerDashboardHeader profile={profile} worker={worker} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Job Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This job is no longer available or has been filled.
            </p>
            <Button asChild>
              <Link href="/worker/jobs">
                Browse Available Jobs
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Check if worker has already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id, status")
    .eq("job_id", jobId)
    .eq("worker_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/worker/jobs" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>

        <JobDetailView 
          job={{
            ...job,
            client: Array.isArray(job.client) ? job.client[0] : job.client
          }}
          hasApplied={!!existingApplication}
          workerSkills={worker.skills || []}
        />
      </main>
    </div>
  );
}
