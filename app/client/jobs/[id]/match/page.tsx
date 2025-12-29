// app/client/jobs/[id]/match/page.tsx

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AIMatchedWorkers } from "@/components/client/ai-matched-workers";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Footer } from "@/components/landing/footer";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Edit, X } from "lucide-react";

type ParamsPromise = Promise<{ id: string }>;

export default async function MatchWorkersPage({
  params,
}: {
  params: ParamsPromise;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get job details
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!job || job.status !== "open") {
    redirect("/client/dashboard");
  }

  // small aggregate example we can show on the page
  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("job_id", id);

  const postedAt = job?.created_at
    ? new Date(job.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // Helper to format budget from min/max (fallback to legacy `budget`)
  function formatBudget(jobObj: any) {
    const min = jobObj?.budget_min_ngn;
    const max = jobObj?.budget_max_ngn;

    if (typeof min === "number" && typeof max === "number") {
      if (min === max) return `₦${min.toLocaleString("en-US")}`;
      return `₦${min.toLocaleString("en-US")} - ₦${max.toLocaleString(
        "en-US"
      )}`;
    }

    if (typeof min === "number") return `From ₦${min.toLocaleString("en-US")}`;
    if (typeof max === "number") return `Up to ₦${max.toLocaleString("en-US")}`;

    // fallback to legacy single `budget` field (could be number or numeric string)
    const legacy = jobObj?.budget;
    if (typeof legacy === "number") return `₦${legacy.toLocaleString("en-US")}`;
    if (typeof legacy === "string" && legacy.trim() !== "")
      return `₦${Number(legacy).toLocaleString("en-US")}`;

    return null;
  }

  const formattedBudget = formatBudget(job);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader profile={null} />

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Breadcrumb + title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-2 text-sm hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
            <span className="text-xs">/</span>
            <Link
              href="/client/jobs"
              className="text-sm text-muted-foreground hover:underline"
            >
              Jobs
            </Link>
            <span className="text-xs">/</span>
            <span className="font-medium truncate max-w-[220px]">
              {job?.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="hidden sm:inline-flex h-9"
              size="sm"
            >
              <Link
                href={`/client/jobs/${id}/edit`}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Job
              </Link>
            </Button>

            <Button asChild variant="ghost" className="h-9">
              <Link
                href={`/client/jobs/${id}/match?refresh=true`}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="sr-only">Refresh matches</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Layout: left (main) / right (sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left + center: job summary and matched workers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job summary card */}
            <Card className="border border-border/30 shadow-sm rounded-2xl">
              <CardHeader className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full">
                  <div className="min-w-0">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {job?.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {job?.short_description ??
                        job?.description ??
                        "No description provided."}
                    </CardDescription>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div>
                        Posted:{" "}
                        <span className="text-foreground font-medium ml-1">
                          {postedAt}
                        </span>
                      </div>
                      <div>|</div>
                      <div>
                        Bookings:{" "}
                        <span className="font-medium ml-1">
                          {bookingsCount ?? 0}
                        </span>
                      </div>
                      {formattedBudget && (
                        <>
                          <div>|</div>
                          <div>
                            Budget:{" "}
                            <span className="font-medium ml-1">
                              {formattedBudget}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="secondary"
                      className="h-9"
                      size="sm"
                    >
                      <Link href={`/client/jobs/${id}/match?refresh=true`}>
                        Refresh Matches
                      </Link>
                    </Button>

                    <Button
                      variant="destructive"
                      className="h-9"
                      size="sm"
                      asChild
                    >
                      <Link href={`/client/jobs/${id}/cancel`}>
                        <X className="w-4 h-4" />
                        Cancel
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Matches: AIMatchedWorkers component */}
            <section aria-labelledby="matches-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="matches-heading" className="text-lg font-semibold">
                  AI Matches
                </h2>
                <p className="text-sm text-muted-foreground">
                  Suggested providers matched to your job
                </p>
              </div>

              <div className="space-y-4">
                {/* The AIMatchedWorkers component should render the actual cards/list */}
                <AIMatchedWorkers jobId={id} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28">
            {/* Quick Tips */}
            <Card className="border border-border/30 shadow-sm rounded-2xl">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold">
                  Smart Hiring Tips
                </CardTitle>
                <CardDescription className="text-xs">
                  Short tips to get better matches
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1 rounded-full bg-primary" />
                    <span>
                      Prefer providers with ≥4.5★ and several completed jobs.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1 rounded-full bg-primary" />
                    <span>
                      Check recent reviews for similar tasks before booking.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1 rounded-full bg-primary" />
                    <span>
                      Confirm availability window and expected start time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1 rounded-full bg-primary" />
                    <span>
                      Set a clear brief and expected deliverable for the
                      provider.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Job stats */}
            <Card className="border border-border/30 shadow-sm rounded-2xl">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold">
                  Job snapshot
                </CardTitle>
                <CardDescription className="text-xs">
                  Quick stats for this job
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium">{job?.status}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Posted</div>
                    <div className="font-medium">{postedAt}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Bookings
                    </div>
                    <div className="font-medium">{bookingsCount ?? 0}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="font-medium">
                      {formattedBudget ?? "Not set"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
