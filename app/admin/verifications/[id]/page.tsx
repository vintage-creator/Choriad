// app/admin/verifications/[id]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { VerificationActions } from "@/components/admin/verification-actions";

interface PageProps {
  params: { id: string };
}

export default async function WorkerVerificationPage({ params }: PageProps) {
  const { id: workerId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // Get worker details
  const { data: worker } = await supabase
    .from("workers")
    .select(
      `
      *,
      profiles!workers_id_fkey(
        full_name,
        email,
        phone,
        created_at
      )
    `
    )
    .eq("id", workerId)
    .single();

  if (!worker) {
    redirect("/admin/verifications");
  }

  let signedDocumentUrl: string | null = null;

  if (worker.id_document_path) {
    const { data } = await supabase.storage
      .from("worker-documents")
      .createSignedUrl(worker.id_document_path, 60 * 10);

    signedDocumentUrl = data?.signedUrl ?? null;
  }

  const workerProfile = Array.isArray(worker.profiles)
    ? worker.profiles[0]
    : worker.profiles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/admin/verifications" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Verifications
          </Link>
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Worker Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* responsive: column on small screens, row on md+ */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage
                      src={
                        worker.profile_pictures_urls?.[0] ||
                        workerProfile?.avatar_url ||
                        ""
                      }
                      alt={
                        workerProfile?.full_name
                          ? `${workerProfile.full_name} avatar`
                          : "Worker avatar"
                      }
                    />
                    <AvatarFallback className="text-xl">
                      {workerProfile?.full_name?.[0] || "W"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold">
                        {workerProfile?.full_name || "Worker"}
                      </h3>
                      <Badge
                        className={
                          worker.verification_status === "verified"
                            ? "bg-green-100 text-green-800"
                            : worker.verification_status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {worker.verification_status || "unknown"}
                      </Badge>
                    </div>

                    {/* small summary on right for md+ */}
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <div className="text-xs">Rating</div>
                        <div className="font-medium">
                          {worker.rating?.toFixed(1) ?? "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs">Completed</div>
                        <div className="font-medium">
                          {worker.completed_jobs ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* details grid -> becomes single column on small screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {workerProfile?.email || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {worker.phone_number || workerProfile?.phone || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {worker.location_city || "N/A"}
                        {worker.location_area
                          ? `, ${worker.location_area}`
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {worker.years_experience
                          ? `${worker.years_experience} experience`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {worker.bio && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {worker.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      ID Type
                    </Label>
                    <p className="font-medium">
                      {worker.id_type || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      ID Number
                    </Label>
                    <p className="font-medium">
                      {worker.id_number || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* show link only when url exists; otherwise show friendly note */}
                {worker.id_document_url ? (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      ID Document
                    </Label>
                    <a
                      href={worker.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Document
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <Label className="text-sm text-muted-foreground mb-1 block">
                      ID Document
                    </Label>
                    <div>No document uploaded</div>
                  </div>
                )}

                {worker.certifications ? (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Certifications
                    </Label>
                    <p className="text-sm">{worker.certifications}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {worker.skills && worker.skills.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Skills
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {/**
                       * Explicitly type the map params so TypeScript does not infer `any`.
                       * If you prefer, you may also add a Worker type and cast worker.skills as `string[]`.
                       */}
                      {worker.skills.map((skill: string, index: number) => (
                        <Badge key={`${skill}-${index}`} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Rating
                    </Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold">
                        {worker.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Completed Jobs
                    </Label>
                    <p className="font-semibold mt-1">
                      {worker.completed_jobs || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Total Reviews
                    </Label>
                    <p className="font-semibold mt-1">
                      {worker.total_reviews || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Actions */}
          {worker.verification_status === "pending" && (
            <VerificationActions workerId={worker.id} />
          )}

          {worker.verification_status === "verified" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-lg">
                    Worker Already Verified
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This worker has been verified on{" "}
                    {new Date(worker.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
