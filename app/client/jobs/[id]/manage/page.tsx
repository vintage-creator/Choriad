// app/client/jobs/[id]/manage/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Phone, Mail, MessageSquare, 
  Calendar, MapPin, Star, Shield, User
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

interface PageProps {
  params: { id: string };
}

export default async function ManageWorkerPage({ params }: PageProps) {
  // params is a plain object — no await
  const { id: jobId } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get job details
  const { data: job } = await supabase
    .from("jobs")
    .select("*, worker:workers!jobs_assigned_worker_id_fkey(*)")
    .eq("id", jobId)
    .eq("client_id", user.id)
    .single();

  if (!job || !job.assigned_worker_id) {
    redirect(`/client/jobs/${jobId}`);
  }

  // Get worker profile
  const { data: worker } = await supabase
    .from("workers")
    .select(`
      *,
      profiles!workers_id_fkey(
        full_name,
        avatar_url,
        email,
        phone
      )
    `)
    .eq("id", job.assigned_worker_id)
    .single();

  // normalize profiles (same pattern you used elsewhere)
  const workerProfile = Array.isArray(worker?.profiles)
    ? worker.profiles[0]
    : worker?.profiles;

  // Get client profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // --- NEW: query bookings for this job to find actual amount (latest booking) ---
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(1);

  const booking = Array.isArray(bookingsData) ? bookingsData[0] ?? null : bookingsData ?? null;

  // determine displayed amount (prefer booking amounts)
  const bookingAmount =
    booking?.amount_ngn ??
    booking?.negotiated_amount ??
    booking?.worker_amount_ngn ??
    null;

  // compute final display string or number
  const displayedAmount = bookingAmount != null
    ? Number(bookingAmount)
    : job?.final_amount_ngn ?? null;

  const budgetString =
    displayedAmount != null
      ? `₦${Number(displayedAmount).toLocaleString()}`
      : job?.budget_min_ngn && job?.budget_max_ngn
      ? `₦${Number(job.budget_min_ngn).toLocaleString()} - ₦${Number(job.budget_max_ngn).toLocaleString()}`
      : "—";

  // also keep a small source label
  const amountSource = bookingAmount != null ? "Booking" : job?.final_amount_ngn ? "Job" : "Budget range";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href={`/client/jobs/${jobId}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Worker</h1>
            <p className="text-muted-foreground">
              Communicate and coordinate with your assigned worker
            </p>
          </div>

          {/* Worker Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* responsive: column on xs, row on sm+ */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* avatar centered on mobile, left on bigger screens */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    { (worker?.profile_pictures_urls?.[0] || workerProfile?.avatar_url) ? (
                      <AvatarImage 
                        src={worker?.profile_pictures_urls?.[0] || workerProfile?.avatar_url} 
                        alt={workerProfile?.full_name || "Worker avatar"}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {workerProfile?.full_name?.[0] || "W"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* main content: full width on mobile */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold truncate">
                        {workerProfile?.full_name || "Worker"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">
                            {worker?.rating != null ? Number(worker.rating).toFixed(1) : "N/A"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({worker?.total_reviews || 0} reviews)
                          </span>
                        </div>

                        {worker?.verification_status === "verified" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {(worker?.location_city || worker?.location_area) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate block max-w-full">
                            {worker?.location_area && `${worker.location_area}, `}
                            {worker?.location_city}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* on wider screens we can show a small contact block to the right */}
                    <div className="hidden sm:flex sm:flex-col sm:items-end gap-2">
                      {workerProfile?.email && (
                        <a href={`mailto:${workerProfile?.email}`} className="text-sm text-muted-foreground hover:underline">
                          {workerProfile?.email}
                        </a>
                      )}
                      {worker?.phone_number || workerProfile?.phone ? (
                        <a href={`tel:${worker?.phone_number || workerProfile?.phone}`} className="text-sm text-muted-foreground hover:underline">
                          {worker?.phone_number || workerProfile?.phone}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {worker?.bio && (
                    <p className="text-sm text-muted-foreground mt-4">
                      {worker.bio}
                    </p>
                  )}

                  {/* stats — stack on mobile and spread on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="text-center sm:text-left p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {worker?.completed_jobs || 0}
                      </div>
                      <div className="text-xs text-blue-700">Jobs Done</div>
                    </div>
                    <div className="text-center sm:text-left p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {/* compute success rate robustly */}
                        {worker?.success_rate
                          ? `${Math.round(worker.success_rate)}%`
                          : worker?.rating >= 4.5
                          ? "95%"
                          : worker?.rating >= 4.0
                          ? "85%"
                          : "75%"}
                      </div>
                      <div className="text-xs text-green-700">Success Rate</div>
                    </div>
                    <div className="text-center sm:text-left p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {worker?.years_experience ?? "N/A"}
                      </div>
                      <div className="text-xs text-purple-700">Experience</div>
                    </div>
                  </div>

                  {/* Mobile contact + actions (shows under content on mobile) */}
                  <div className="mt-4 sm:hidden grid grid-cols-1 gap-2">
                    {worker?.phone_number || workerProfile?.phone ? (
                      <a href={`tel:${worker?.phone_number || workerProfile?.phone}`} className="w-full inline-flex items-center gap-2 border rounded-lg py-2 px-3 text-sm hover:bg-gray-50">
                        <Phone className="h-4 w-4" />
                        <span className="truncate">{worker?.phone_number || workerProfile?.phone}</span>
                      </a>
                    ) : null}
                    {workerProfile?.email && (
                      <a href={`mailto:${workerProfile.email}`} className="w-full inline-flex items-center gap-2 border rounded-lg py-2 px-3 text-sm hover:bg-gray-50">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{workerProfile.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Card */}
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href={`tel:${worker?.phone_number || workerProfile?.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Worker
                  </a>
                </Button>

                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href={`mailto:${workerProfile?.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chat (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <div className="font-semibold">
                      {budgetString}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {/* show source when relevant */}
                      {amountSource === "Booking" ? (
                        <>Amount shown from latest booking (₦{bookingAmount?.toLocaleString()})</>
                      ) : amountSource === "Job" ? (
                        <>Taken from job.final_amount_ngn</>
                      ) : (
                        <>Budget range</>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div>
                      <Badge className="capitalize">{String(job.status || "").replaceAll("_", " ")}</Badge>
                    </div>
                  </div>

                  {job.scheduled_date && (
                    <div>
                      <span className="text-muted-foreground">Scheduled:</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.scheduled_date).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button asChild>
                  <Link href={`/client/jobs/${jobId}/track`}>
                    Track Progress
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href={`/worker/public-profile/${worker?.id}`}>
                    View Worker Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
