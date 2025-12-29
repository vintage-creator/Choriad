// app/admin/verifications/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // Get all workers with pending verification
  const { data: pendingWorkers } = await supabase
    .from("workers")
    .select(
      `
      *,
      profiles!workers_id_fkey(
        full_name,
        email,
        created_at
      )
    `
    )
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  // Get recently verified workers
  const { data: verifiedWorkers } = await supabase
    .from("workers")
    .select(
      `
      *,
      profiles!workers_id_fkey(
        full_name,
        email,
        created_at
      )
    `
    )
    .eq("verification_status", "verified")
    .order("updated_at", { ascending: false })
    .limit(10);

  // Get rejected workers
  const { data: rejectedWorkers } = await supabase
    .from("workers")
    .select(
      `
      *,
      profiles!workers_id_fkey(
        full_name,
        email,
        created_at
      )
    `
    )
    .eq("verification_status", "rejected")
    .order("updated_at", { ascending: false })
    .limit(10);

  const stats = [
    {
      title: "Pending Review",
      value: pendingWorkers?.length || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Verified",
      value: verifiedWorkers?.length || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: rejectedWorkers?.length || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Worker Verifications</h1>
          <p className="text-muted-foreground">
            Review and approve worker verification requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pending Verifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="h-5 w-5" />
              Pending Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingWorkers || pendingWorkers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No pending verification requests at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWorkers.map((worker) => {
                  const workerProfile = Array.isArray(worker.profiles)
                    ? worker.profiles[0]
                    : worker.profiles;

                  return (
                    <div
                      key={worker.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage
                            src={worker.profile_pictures_urls?.[0]}
                          />
                          <AvatarFallback>
                            {workerProfile?.full_name?.[0] || "W"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {workerProfile?.full_name || "Worker"}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {workerProfile?.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {worker.id_type && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {worker.id_type}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Applied{" "}
                              {new Date(
                                workerProfile?.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                        <Button asChild size="sm">
                          <Link href={`/admin/verifications/${worker.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Verified */}
        {verifiedWorkers && verifiedWorkers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recently Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifiedWorkers.map((worker) => {
                  const workerProfile = Array.isArray(worker.profiles)
                    ? worker.profiles[0]
                    : worker.profiles;

                  return (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={worker.profile_pictures_urls?.[0]}
                          />
                          <AvatarFallback>
                            {workerProfile?.full_name?.[0] || "W"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {workerProfile?.full_name || "Worker"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Verified{" "}
                            {new Date(worker.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
