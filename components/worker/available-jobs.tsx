// components/worker/available-jobs.tsx 
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PiggyBank, MapPin, Clock, Shield, Building, User, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link"; // Added Link import

interface ClientRow {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
}

interface Job {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  location_city?: string | null;
  location_area?: string | null;
  location_address?: string | null;
  budget_min_ngn?: number | null;
  budget_max_ngn?: number | null;
  urgency?: string | null;
  created_at: string;
  status?: string | null;
  skills_required?: string[];
  client?: ClientRow | ClientRow[] | null;
}

interface AvailableJobsProps {
  jobs: Job[];
  workerSkills?: string[];
  showEmptyState?: boolean;
  workerCity?: string | null;
}

export function AvailableJobs({
  jobs,
  workerSkills = [],
  showEmptyState = false,
  workerCity = null,
}: AvailableJobsProps) {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const jobsArray = Array.isArray(jobs) ? jobs : [];

  const calculateMatchScore = (job: Job) => {
    let score = 0;
    if (job.skills_required && workerSkills.length > 0) {
      const matchingSkills = job.skills_required.filter((s) =>
        workerSkills.includes(s)
      ).length;
      score += (matchingSkills / job.skills_required.length) * 50;
    }
    // location baseline
    score += 30;
    if (job.urgency === "urgent") score += 20;
    return Math.min(100, Math.round(score));
  };

  useEffect(() => {
    const fetchApplications = async () => {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("worker_id", user.id);

      if (!error && data) {
        setAppliedJobIds(new Set(data.map((a) => a.job_id)));
      }
    };

    fetchApplications();
  }, []);

  const handleApply = async (jobId: string) => {
    setIsLoading(jobId);
    const supabase = createClient();
    const toastId = toast.loading("Applying...");

    try {
      // 1) auth
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = (authData as any)?.user;
      if (!user) {
        toast.dismiss(toastId);
        toast.error("Please sign in to apply for jobs");
        setIsLoading(null);
        return;
      }

      // 2) fetch latest job row to ensure it's still open
      const { data: jobRow, error: jobErr } = await supabase
        .from("jobs")
        .select(
          "id, client_id, budget_min_ngn, budget_max_ngn, scheduled_date, status"
        )
        .eq("id", jobId)
        .maybeSingle();

      if (jobErr) throw jobErr;
      if (!jobRow) {
        toast.dismiss(toastId);
        toast.error("Job not found");
        setIsLoading(null);
        return;
      }
      if (jobRow.status !== "open") {
        toast.dismiss(toastId);
        toast.error("This job is no longer open");
        setIsLoading(null);
        return;
      }

      // 3) check existing application
      const { data: existing, error: existingErr } = await supabase
        .from("applications")
        .select("id, status")
        .eq("job_id", jobId)
        .eq("worker_id", user.id)
        .maybeSingle();

      if (existingErr && (existingErr as any).code !== "PGRST116") {
        throw existingErr;
      }
      if (existing) {
        toast.dismiss(toastId);
        toast("You've already applied for this job", { icon: "ℹ️" });
        setIsLoading(null);
        return;
      }

      // 4) insert application
      const { error: insertErr } = await supabase.from("applications").insert({
        job_id: jobId,
        worker_id: user.id,
        status: "pending",
        proposed_amount: jobRow.budget_min_ngn,
        cover_letter: "I am interested in this job and ready to start immediately.",
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        throw insertErr;
      }

      toast.dismiss(toastId);
      toast.success("Application submitted successfully!");
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      
      // Create notification for client
      await supabase.from("notifications").insert({
        user_id: jobRow.client_id,
        type: "new_application",
        title: "New Job Application",
        message: `A worker has applied for your job`,
        data: { 
          job_id: jobId,
          worker_id: user.id 
        },
        read: false,
      });
      
      router.refresh();
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error("Apply error:", err);

      if (err?.code === "42501") {
        toast.error(
          "Row-level security prevented the action (check your RLS policies)."
        );
      } else if (err?.code === "23502") {
        toast.error("Required DB column missing. (Server schema mismatch)");
      } else if (err?.code) {
        toast.error(`${err.message} (${err.code})`);
      } else {
        toast.error(err?.message ?? "Failed to apply");
      }
    } finally {
      setIsLoading(null);
    }
  };

  const urgencyColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    normal: "bg-blue-100 text-blue-800",
    low: "bg-gray-100 text-gray-800",
  };

  if (showEmptyState && jobsArray.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            No open jobs were found in {workerCity ? workerCity : "your area"}.
            Try broadening your search or check again later.
          </p>
          <Button onClick={() => router.refresh()}>Refresh Jobs</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Job Opportunities
            </h2>
            <p className="text-gray-600">
              Browse and apply for jobs that match your profile
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="grid" className="w-auto">
              <TabsList>
                <TabsTrigger value="grid" onClick={() => setView("grid")}>
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" onClick={() => setView("list")}>
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {jobsArray.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No job opportunities
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                There are currently no open jobs in {workerCity ?? "your city"}.
                Try changing your city or check back later.
              </p>
              <Button onClick={() => router.refresh()}>Refresh</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {view === "grid" ? (
              <div className="grid md:grid-cols-2 gap-4">
                {jobsArray.map((job) => {
                  const matchScore = calculateMatchScore(job);
                  const hasApplied = appliedJobIds.has(job.id);

                  const client: ClientRow = Array.isArray(job.client)
                    ? job.client[0] ?? {}
                    : job.client ?? {};
                  const budgetDisplay = job.budget_max_ngn
                    ? `₦${
                        job.budget_min_ngn?.toLocaleString() ??
                        job.budget_max_ngn.toLocaleString()
                      } - ₦${job.budget_max_ngn.toLocaleString()}`
                    : job.budget_min_ngn
                    ? `₦${job.budget_min_ngn.toLocaleString()}`
                    : "Negotiable";

                  return (
                    <Card
                      key={job.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2 line-clamp-1">
                              {job.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={client?.avatar_url || ""} />
                                <AvatarFallback>
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                {client?.full_name ?? "Client"}
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={urgencyColors[job.urgency ?? "normal"]}
                          >
                            {job.urgency ?? "normal"}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-3">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {job.description ?? "No description"}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <PiggyBank className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">
                                {budgetDisplay}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>
                                {job.location_area ?? job.location_city}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span>
                                {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4 text-purple-600" />
                              <span>{matchScore}% match</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(job.skills_required ?? [])
                              .slice(0, 3)
                              .map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className={`text-xs ${
                                    workerSkills.includes(skill)
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : ""
                                  }`}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {job.skills_required &&
                              job.skills_required.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills_required.length - 3} more
                                </Badge>
                              )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/worker/jobs/${job.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={hasApplied || isLoading === job.id}
                          variant={hasApplied ? "default" : "secondary"}
                          onClick={() => handleApply(job.id)}
                        >
                          {hasApplied
                            ? "Applied"
                            : isLoading === job.id
                            ? "Applying..."
                            : "Apply Now"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {jobsArray.map((job) => {
                  const matchScore = calculateMatchScore(job);
                  const hasApplied = appliedJobIds.has(job.id);
                  const client: ClientRow = Array.isArray(job.client)
                    ? job.client[0] ?? {}
                    : job.client ?? {};
                  const budgetDisplay = job.budget_max_ngn
                    ? `₦${
                        job.budget_min_ngn?.toLocaleString() ??
                        job.budget_max_ngn.toLocaleString()
                      } - ₦${job.budget_max_ngn.toLocaleString()}`
                    : job.budget_min_ngn
                    ? `₦${job.budget_min_ngn.toLocaleString()}`
                    : "Negotiable";

                  return (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    urgencyColors[job.urgency ?? "normal"]
                                  }
                                >
                                  {job.urgency ?? "normal"}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50">
                                  {matchScore}% match
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={client?.avatar_url || ""} />
                                  <AvatarFallback>
                                    <User className="h-2.5 w-2.5" />
                                  </AvatarFallback>
                                </Avatar>
                                <span>{client?.full_name ?? "Client"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {job.location_city ?? ""}
                                  {job.location_area
                                    ? `, ${job.location_area}`
                                    : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <PiggyBank className="h-4 w-4" />
                                <span className="font-semibold">
                                  {budgetDisplay}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {(job.skills_required ?? []).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className={`text-xs ${
                                    workerSkills.includes(skill)
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : ""
                                  }`}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <Button
                              size="sm"
                              onClick={() => handleApply(job.id)}
                              disabled={hasApplied || isLoading === job.id}
                              variant={hasApplied ? "default" : "secondary"}
                            >
                              {hasApplied ? "Applied" : isLoading === job.id ? "Applying..." : "Apply Now"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/worker/jobs/${job.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Keep the dialog for quick view if needed */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        {selectedJob && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJob.title}</DialogTitle>
              <DialogDescription>
                Posted by{" "}
                {(Array.isArray(selectedJob.client)
                  ? selectedJob.client[0]?.full_name
                  : selectedJob.client?.full_name) ?? "Client"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="font-semibold">
                    {selectedJob.budget_max_ngn
                      ? `₦${
                          selectedJob.budget_min_ngn?.toLocaleString() ??
                          selectedJob.budget_max_ngn.toLocaleString()
                        } - ₦${selectedJob.budget_max_ngn?.toLocaleString()}`
                      : selectedJob.budget_min_ngn
                      ? `₦${selectedJob.budget_min_ngn.toLocaleString()}`
                      : "Negotiable"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold">
                    {selectedJob.location_city}
                    {selectedJob.location_area
                      ? `, ${selectedJob.location_area}`
                      : ""}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Urgency</div>
                  <Badge
                    className={urgencyColors[selectedJob.urgency ?? "normal"]}
                  >
                    {selectedJob.urgency ?? "normal"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Posted</div>
                  <div className="font-semibold">
                    {new Date(selectedJob.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Job Description</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedJob.skills_required ?? []).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className={
                        workerSkills.includes(skill)
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    handleApply(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  disabled={isLoading === selectedJob.id}
                >
                  {isLoading === selectedJob.id
                    ? "Applying..."
                    : "Apply for this Job"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}