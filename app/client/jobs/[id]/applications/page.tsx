// app/client/jobs/[id]/applications/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { JobApplications } from "@/components/client/job-applications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const { id: jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("client_id", user.id)
    .single();

  if (jobError || !job) {
    console.error("Error fetching job:", jobError);
    redirect("/client/dashboard");
  }

  // Get applications for this job
  const { data: applicationsRaw, error: appsError } = await supabase
  .from("applications")
  .select(`
    *,
    worker:workers(
      id,
      bio,
      rating,
      completed_jobs,
      total_jobs,
      verification_status,
      skills,
      profile_pictures_urls,
      phone_number,
      location_city,
      location_area,
      years_experience,
      certifications,
      available_days,
      available_times,
      transportation,
      tools_equipment,
      hourly_rate_ngn,
      facebook_url,
      twitter_url,
      instagram_url,
      tiktok_url,
      linkedin_url,
      total_reviews,
      profiles!workers_id_fkey(
        full_name,
        avatar_url,
        email,
        created_at
      )
    )
  `)
  .eq("job_id", jobId)
  .order("created_at", { ascending: false });

  const applications = (applicationsRaw || []).map((app: any) => {
    const worker = app.worker ?? {};
    const profiles = Array.isArray(worker.profiles) 
      ? worker.profiles[0] ?? null 
      : worker.profiles ?? null;

    return {
      ...app,
      worker: {
        ...worker,
        user_id: worker.id, 
        profiles,
      },
    };
  });

  // Get client profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href={`/client/jobs/${jobId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Job Details
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Applications for {job.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Review and select the best worker for your task
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                <Users className="h-4 w-4" />
                {applications?.length || 0} Applications
              </span>
            </div>
          </div>
        </div>

        {applications && applications.length > 0 ? (
          <JobApplications 
            job={job} 
            applications={applications} 
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                No workers have applied for this task yet. Try promoting it or adjust the budget to attract more applicants.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/client/jobs/${jobId}/match`}>
                    Find Workers
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/client/jobs/${jobId}/edit`}>
                    Edit Task
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}