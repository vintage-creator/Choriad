// app/worker/applications/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, MapPin, PiggyBank, Clock, 
  Eye, MessageSquare, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

export default async function WorkerApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    redirect("/worker/setup");
  }

  if (!profile) {
    redirect("/worker/setup");
  }

  if (profile.user_type !== "worker") {
    redirect("/client/dashboard");
  }

  const { data: worker, error: workerError } = await supabase
  .from("workers")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();


  if (workerError) {
    console.error("Error fetching worker row:", workerError);
    redirect("/worker/setup");
  }

  if (!worker) {
    redirect("/worker/setup");
  }

  const { data: applicationsRaw, error: appsError } = await supabase
  .from("applications")
  .select(`
    *,
    job:jobs(
      id,
      title,
      description,
      category,
      location_city,
      location_area,
      budget_min_ngn,
      budget_max_ngn,
      urgency,
      status,
      created_at,
      profiles!jobs_client_id_fkey(
        full_name,
        avatar_url
      )
    )
  `)
  .eq("worker_id", user.id)
  .order("created_at", { ascending: false });

const applications = (applicationsRaw || []).map((app: any) => {
  const job = app.job ?? {};
  const client = Array.isArray(job.profiles) ? job.profiles[0] ?? null : job.profiles ?? null;
  
  return {
    ...app,
    job: {
      ...job,
      client, 
    },
  };
});

  const statusColors = {
    pending: "bg-blue-100 text-blue-800",
    reviewed: "bg-purple-100 text-purple-800",
    hired: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-800",
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Applications
              </h1>
              <p className="text-gray-600">
                Track the status of all your job applications
              </p>
            </div>
            <Button asChild>
              <Link href="/worker/jobs">
                Browse More Jobs
              </Link>
            </Button>
          </div>
        </div>

        {!applications || (Array.isArray(applications) && applications.length === 0) ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                You haven't applied for any jobs yet. Browse available jobs in your area to get started.
              </p>
              <Button asChild>
                <Link href="/worker/jobs">
                  Browse Jobs
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application: any) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {application.job?.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${statusColors[application.status as keyof typeof statusColors] ?? "bg-gray-100 text-gray-800"}`}>
  {application.status}
</Badge>
                            <span className="text-sm text-gray-500">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-700">
                            {application.proposed_amount 
                              ? `₦${application.proposed_amount.toLocaleString()}`
                              : application.job?.budget_min_ngn
                              ? `₦${application.job.budget_min_ngn.toLocaleString()}+`
                              : "Negotiable"
                            }
                          </div>
                          <div className="text-sm text-gray-500">Your proposed rate</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {application.job?.location_city}
                            {application.job?.location_area && `, ${application.job.location_area}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm capitalize">
                            {application.job?.urgency?.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Posted {new Date(application.job?.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Client:</span>
                          <span className="font-medium">
  {application.job?.client?.full_name ?? "Unknown client"}
</span>
                        </div>
                      </div>

                      {application.proposed_amount 
  ? `₦${Number(application.proposed_amount).toLocaleString()}`
  : application.job?.budget_min_ngn
    ? `₦${application.job.budget_min_ngn.toLocaleString()}+`
    : "Negotiable"
}

                      {/* Cover Letter */}
                      {application.cover_letter && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Your Cover Letter</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="md:w-64 space-y-3">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/worker/jobs/${application.job?.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Job
                        </Link>
                      </Button>

                      {application.status === "pending" && (
                        <>
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Message
                          </Button>
                          <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                            <XCircle className="mr-2 h-4 w-4" />
                            Withdraw Application
                          </Button>
                        </>
                      )}

                      {application.status === "hired" && (
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                          <Link href={`/worker/bookings?job=${application.job?.id}`}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            View Booking
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {applications && applications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Application Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {applications.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter((a: any) => a.status === "hired").length}
                  </div>
                  <div className="text-sm text-gray-600">Hired</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter((a: any) => a.status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {applications.filter((a: any) => a.status === "rejected").length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
