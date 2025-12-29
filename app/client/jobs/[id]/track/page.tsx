// app/client/jobs/[id]/track/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Star,
  MessageSquare,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

interface PageProps {
  params: { id: string };
}

type TimelineEvent = {
  id: string;
  date: string; // ISO
  title: string;
  description?: string;
  icon?: any;
  colorClass?: string;
  bgClass?: string;
};

export default async function TrackProgressPage({ params }: PageProps) {
  const { id: jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load job with worker + minimal profile
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      *,
      worker:workers!jobs_assigned_worker_id_fkey(
        id,
        phone_number,
        rating,
        completed_jobs,
        profile_pictures_urls,
        profiles!workers_id_fkey(full_name, avatar_url, email)
      )
    `
    )
    .eq("id", jobId)
    .eq("client_id", user.id)
    .single();

  if (jobError || !job) {
    // fallback to dashboard if job not found
    redirect("/client/dashboard");
  }

  // normalize worker profile
  const worker = job.worker ?? null;
  const workerProfile = Array.isArray(worker?.profiles)
    ? worker.profiles[0]
    : worker?.profiles;

  // client profile (for header)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // --- Read booking records for this job (real DB) ---
  // We'll use bookings to derive meaningful timeline events (booking created, payment, completion, release)
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true }); // chronological order

  const bookings = bookingsData ?? [];

  // Helper to format date
  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString() : "Unknown";

  // Build timeline from available fields (job + bookings)
  const events: TimelineEvent[] = [];

  // Job created
  if (job.created_at) {
    events.push({
      id: `job-created-${job.id}`,
      date: job.created_at,
      title: "Job created",
      description: `Job was created by you.`,
      icon: Clock,
      colorClass: "text-slate-700",
      bgClass: "bg-slate-50",
    });
  }

  // If there's a scheduled date on job
  if (job.scheduled_date) {
    events.push({
      id: `job-scheduled-${job.id}`,
      date: job.scheduled_date,
      title: "Scheduled",
      description: `Job scheduled for ${new Date(
        job.scheduled_date
      ).toLocaleString()}`,
      icon: Calendar,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    });
  }

  // If an assigned worker exists, try to show assignment using earliest booking or job updated
  if (job.assigned_worker_id) {
    // try to find a booking that indicates assignment or use job.updated_at / created_at as fallback
    const assignedAt =
      bookings.find(
        (b: any) => b.status === "confirmed" || b.status === "in_progress"
      )?.created_at ??
      job.updated_at ??
      null;

    events.push({
      id: `job-assigned-${job.id}`,
      date: assignedAt ?? job.created_at ?? new Date().toISOString(),
      title: "Worker assigned",
      description: `Assigned to ${workerProfile?.full_name ?? "a worker"}`,
      icon: CheckCircle,
      colorClass: "text-green-600",
      bgClass: "bg-green-50",
    });
  }

  // Add booking events (each booking provides multiple potential events)
  for (const b of bookings) {
    const bid = String(b.id || Math.random());
    // Booking created
    if (b.created_at) {
      events.push({
        id: `booking-created-${bid}`,
        date: b.created_at,
        title: `Booking (${b.status || "booked"})`,
        description: b.amount_ngn
          ? `Booking created — ₦${Number(b.amount_ngn).toLocaleString()}`
          : "Booking created",
        icon: Clock,
        colorClass: "text-slate-700",
        bgClass: "bg-slate-50",
      });
    }

    // negotiated / worker amount
    if (b.negotiated_amount) {
      events.push({
        id: `booking-negotiated-${bid}`,
        date: b.updated_at ?? b.created_at ?? new Date().toISOString(),
        title: `Amount negotiated`,
        description: `Negotiated: ₦${Number(
          b.negotiated_amount
        ).toLocaleString()}`,
        icon: Clock,
        colorClass: "text-indigo-600",
        bgClass: "bg-indigo-50",
      });
    }

    // payment
    if (
      b.paid_at ||
      b.payment_status === "paid" ||
      b.payment_status === "completed"
    ) {
      events.push({
        id: `booking-paid-${bid}`,
        date: b.paid_at ?? b.updated_at ?? b.created_at,
        title: `Payment received`,
        description: b.amount_ngn
          ? `₦${Number(b.amount_ngn).toLocaleString()}`
          : "Payment recorded",
        icon: CheckCircle,
        colorClass: "text-green-600",
        bgClass: "bg-green-50",
      });
    }

    // completion at booking level
    if (b.completed_at || b.status === "completed") {
      events.push({
        id: `booking-completed-${bid}`,
        date: b.completed_at ?? b.updated_at ?? b.created_at,
        title: `Work completed (booking)`,
        description: b.completion_notes ?? "Worker marked booking as completed",
        icon: Star,
        colorClass: "text-amber-600",
        bgClass: "bg-amber-50",
      });
    }

    // release / payout
    if (b.released_at) {
      events.push({
        id: `booking-released-${bid}`,
        date: b.released_at,
        title: `Funds released`,
        description: b.worker_amount_ngn
          ? `₦${Number(b.worker_amount_ngn).toLocaleString()} released`
          : "Funds released",
        icon: CheckCircle,
        colorClass: "text-purple-700",
        bgClass: "bg-purple-50",
      });
    }
  }

  // Job-level completed
  const jobCompletedAt =
    job.completed_at ??
    bookings
      .slice()
      .reverse()
      .find((b: any) => b.completed_at)?.completed_at ??
    null;

  if (job.status === "completed" && jobCompletedAt) {
    events.push({
      id: `job-completed-${job.id}`,
      date: jobCompletedAt,
      title: "Job completed",
      description: `Marked completed on ${fmt(jobCompletedAt)}`,
      icon: Star,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    });
  }

  // Sort events chronologically ascending
  const sorted = events
    .filter((e) => !!e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // If there are no events (rare), add a fallback
  if (sorted.length === 0) {
    sorted.push({
      id: "none",
      date: new Date().toISOString(),
      title: "No timeline events",
      description: "No events recorded for this job yet.",
      icon: Clock,
      colorClass: "text-gray-600",
      bgClass: "bg-gray-50",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link
            href={`/client/jobs/${jobId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Track Progress</h1>
            <p className="text-muted-foreground">
              Monitor the status of your job and communicate with your worker
            </p>
          </div>

          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Scheduled:{" "}
                      {job.scheduled_date
                        ? new Date(job.scheduled_date).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>

                  <div>
                    <Badge className="capitalize">
                      {String(job.status || "").replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Timeline wrapper */}
              <div className="relative">
                {/* center vertical line on md+ */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-6 bottom-6 w-px bg-gray-300" />

                <div className="space-y-8">
                  {sorted.map((ev, idx) => {
                    const Icon = ev.icon ?? Clock;
                    const isLeft = idx % 2 === 0;
                    return (
                      <div key={ev.id} className="relative">
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div
                            className={`md:w-1/2 md:pr-6 ${
                              isLeft ? "md:text-right md:pr-8" : "md:pl-8"
                            }`}
                          >
                            {/* On mobile we show simple layout */}
                            <div
                              className={`flex items-center md:justify-${
                                isLeft ? "end" : "start"
                              } gap-4`}
                            >
                              <div
                                className={`p-2 rounded-full ${
                                  ev.bgClass ?? "bg-gray-100"
                                }`}
                              >
                                <Icon
                                  className={`${
                                    ev.colorClass ?? "text-gray-500"
                                  } h-5 w-5`}
                                />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">{ev.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {fmt(ev.date)}
                                </div>
                                {ev.description && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {ev.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* center marker for md+ */}
                          <div className="md:flex md:items-center md:justify-center md:w-0">
                            <div className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  ev.bgClass ?? "bg-gray-200"
                                }`}
                              />
                            </div>
                            {/* line connector on mobile (small dot + small vertical line) */}
                            <div className="md:hidden flex items-center ml-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  ev.bgClass ?? "bg-gray-200"
                                }`}
                              />
                              <div className="w-px h-6 bg-gray-200 ml-2" />
                            </div>
                          </div>

                          {/* right side */}
                          <div
                            className={`md:w-1/2 ${
                              isLeft ? "md:pl-8" : "md:pr-8"
                            }`}
                          >
                            <div className="hidden md:block"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completed banner if job completed */}
              {job.status === "completed" && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Job Completed!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Please review the work and leave feedback for the
                        worker.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-green-600 hover:bg-green-700"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Worker Info */}
          {worker && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Worker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {workerProfile?.avatar_url ||
                    worker?.profile_pictures_urls?.[0] ? (
                      <AvatarImage
                        src={
                          workerProfile?.avatar_url ||
                          worker?.profile_pictures_urls?.[0]
                        }
                        alt={workerProfile?.full_name || "Worker"}
                      />
                    ) : (
                      <AvatarFallback>
                        {workerProfile?.full_name?.[0] || "W"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {workerProfile?.full_name || "Worker"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>
                        {worker?.rating != null
                          ? Number(worker.rating).toFixed(1)
                          : "N/A"}
                      </span>
                      <span>•</span>
                      <span>{worker?.completed_jobs || 0} jobs completed</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {worker?.phone_number && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${worker.phone_number}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Link href={`/client/jobs/${jobId}/manage`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {job.status === "in_progress" && (
                  <Button className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/client/jobs/${jobId}/manage`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Worker
                  </Link>
                </Button>

                {job.status === "completed" && (
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report an Issue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
