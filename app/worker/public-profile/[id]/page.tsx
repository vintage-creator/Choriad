// app/(public)/workers/[id]/page.tsx
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewsDisplay } from "@/components/worker/reviews-display";
import {
  CheckCircle,
  MapPin,
  PiggyBank,
  Star,
  Award,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Calendar,
  ExternalLink as ExternalLinkIcon,
  Phone,
  Mail,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

type WorkerRow = any;

function timeAgo(dateString?: string | null) {
  if (!dateString) return "unknown";
  const d = new Date(dateString);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// normalize Supabase joined profiles
const normalizeProfile = (maybeProfile: any) => {
  if (!maybeProfile) return null;
  if (Array.isArray(maybeProfile)) return maybeProfile[0] ?? null;
  return maybeProfile;
};

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default async function PublicWorkerProfile({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  // Worker + profile
  const { data: workerData, error: workerError } = await supabase
    .from("workers")
    .select(`*, profile:profiles(*)`)
    .eq("id", id)
    .maybeSingle();

  if (workerError || !workerData) {
    notFound();
  }
  const worker: WorkerRow = workerData;

  // Reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
    *,
    client:profiles!reviews_client_id_fkey(
      id,
      full_name,
      avatar_url
    )
  `
    )
    .eq("worker_id", id)
    .order("created_at", { ascending: false });

  const totalReviews = reviews?.length ?? 0;

  let averageRating = 0;
  if (reviews && reviews.length > 0) {
    averageRating =
      reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
      reviews.length;
  }

  const rating = Number(averageRating.toFixed(1));

  // Recent bookings (latest 5 bookings including completed)
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      client:profiles ( id, full_name, avatar_url ),
      status,
      created_at,
      scheduled_date,
      amount_ngn,
      commission_ngn
    `
    )
    .eq("worker_id", id)
    .in("status", [
      "pending_payment",
      "processing",
      "confirmed",
      "in_progress",
      "completed",
    ])
    .order("created_at", { ascending: false })
    .limit(5);

  if (bookingsError)
    console.error("Error fetching recent bookings:", bookingsError);

  // Dynamically count completed jobs
  const { count: completedJobsCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("worker_id", id)
    .eq("status", "completed");

  const completedJobs = completedJobsCount ?? 0;

  const latestBooking = bookings && bookings.length > 0 ? bookings[0] : null;
  const latestClient = normalizeProfile(latestBooking?.client);
  const isBooked = !!latestBooking;
  const bookedBy = latestClient?.full_name ?? null;
  const bookedWhen =
    latestBooking?.created_at ?? latestBooking?.scheduled_date ?? null;
  const bookedStatus = latestBooking?.status ?? null;

  // Resolve avatar
  let resolvedAvatarUrl: string | null = null;
  const profileAvatar = worker?.profile?.avatar_url ?? null;
  const workerFirstPic =
    Array.isArray((worker as any).profile_pictures_urls) &&
    (worker as any).profile_pictures_urls.length
      ? (worker as any).profile_pictures_urls[0]
      : null;
  const candidate = profileAvatar || workerFirstPic || null;

  if (candidate) {
    try {
      if (typeof candidate === "string" && candidate.startsWith("http")) {
        resolvedAvatarUrl = candidate;
      } else {
        const path = String(candidate).replace(/^\/+/, "");
        const { data: publicData } = supabase.storage
          .from("worker-profiles")
          .getPublicUrl(path);
        resolvedAvatarUrl =
          (publicData as any)?.publicUrl ||
          (publicData as any)?.publicURL ||
          null;
      }
    } catch (e) {
      console.warn("Could not resolve avatar public URL:", e);
      resolvedAvatarUrl = null;
    }
  }

  // Social links
  const linkedin = worker.linkedin_url || worker.profile?.linkedin_url || null;
  const facebook = worker.facebook_url || worker.profile?.facebook_url || null;
  const twitter = worker.twitter_url || worker.profile?.twitter_url || null;
  const instagram =
    worker.instagram_url || worker.profile?.instagram_url || null;
  const tiktok = worker.tiktok_url || worker.profile?.tiktok_url || null;

  const socialLinks: { url: string; Icon: any; label: string }[] = [
    ...(linkedin ? [{ url: linkedin, Icon: Linkedin, label: "LinkedIn" }] : []),
    ...(facebook ? [{ url: facebook, Icon: Facebook, label: "Facebook" }] : []),
    ...(twitter ? [{ url: twitter, Icon: Twitter, label: "Twitter" }] : []),
    ...(instagram
      ? [{ url: instagram, Icon: Instagram, label: "Instagram" }]
      : []),
    ...(tiktok ? [{ url: tiktok, Icon: TikTokIcon, label: "TikTok" }] : []),
  ];

  const fullName =
    worker.profile?.full_name ||
    worker.profiles?.full_name ||
    worker.full_name ||
    "Worker";

  const email = worker.profile?.email || worker.profiles?.email || null;
  const phone = worker.phone_number || worker.profile?.phone_number || null;

  const successRate =
    typeof worker.success_rate === "number"
      ? `${Math.round(worker.success_rate)}%`
      : rating >= 4.5
      ? "95%"
      : rating >= 4.0
      ? "85%"
      : "75%";

  const proposed = worker.proposed_amount ?? null;
  const hourly =
    worker.hourly_rate_ngn ?? worker.profile?.hourly_rate_ngn ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:to-slate-950">
      {/* HEADER */}
      <div className="border-b">
        <div className="flex items-center h-24">
          <Link href="/" className="flex items-center space-x-2">
            <Header />
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {/* LEFT PROFILE */}
          <aside className="lg:col-span-1">
            {/* Profile card */}
            <Card className="lg:sticky lg:top-6 shadow-sm">
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 mb-4 border-4 border-white shadow-xl">
                      {resolvedAvatarUrl ? (
                        <AvatarImage
                          src={resolvedAvatarUrl}
                          alt={`${fullName} avatar`}
                        />
                      ) : (
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-emerald-600 text-white">
                          {fullName.charAt(0) || "W"}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {isBooked && (
                      <span className="absolute -bottom-2 right-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 mb-4">
                        <CheckCircle className="h-3 w-3" />
                        Booked
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg sm:text-2xl font-bold leading-tight mb-1 truncate max-w-[18rem]">
                    {fullName}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-3 truncate max-w-[20rem]">
                    {worker.profession ||
                      worker.profile?.profession ||
                      worker.title ||
                      ""}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {worker.verification_status === "verified" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {worker.years_experience && (
                      <Badge variant="outline" className="text-sm">
                        {worker.years_experience} yrs
                      </Badge>
                    )}
                    {worker.availability_status && (
                      <Badge variant="secondary" className="text-sm">
                        {worker.availability_status}
                      </Badge>
                    )}
                  </div>

                  {/* Rating + Stats */}
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <div>
                          <div className="font-semibold text-lg">
                            {rating.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({totalReviews} reviews)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-sm text-muted-foreground">
                          Completed
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {completedJobs}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-sm text-muted-foreground">
                          Success Rate
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {successRate}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-sm text-muted-foreground">
                          Proposed
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {proposed
                            ? `₦${proposed.toLocaleString()}`
                            : "Flexible"}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-sm text-muted-foreground">
                          Hourly
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {hourly ? `₦${hourly.toLocaleString()}/hr` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact + Socials */}
                  <div className="w-full mt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center justify-center gap-2 border rounded-lg py-2 text-sm hover:bg-gray-50"
                        >
                          <Phone className="h-4 w-4 shrink-0" />
                          <span className="font-medium truncate">{phone}</span>
                        </a>
                      )}

                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="inline-flex items-center justify-center gap-2 border rounded-lg py-2 text-sm hover:bg-gray-50"
                        >
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="font-medium truncate">{email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <div className="w-full mt-6">
                    {isBooked ? (
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">
                          Recently booked
                        </div>
                        <div className="font-medium truncate">
                          Booked by {bookedBy ?? "a client"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {timeAgo(bookedWhen)}
                        </div>
                        <div className="mt-3">
                          <button
                            className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                            disabled
                          >
                            Booked — {bookedStatus}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/book/${worker.id}`}
                        className="w-full inline-block bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-medium text-center shadow-sm"
                      >
                        Book Now
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* RIGHT - Details, Bookings, Reviews */}
          <section className="lg:col-span-3 space-y-6">
            {/* About + actions */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">{fullName}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground truncate">
                    {worker.profession || worker.title || "Service Provider"}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <b> Bio:</b>{" "}
                  {worker.bio ??
                    worker.profile?.bio ??
                    "No biography provided."}
                </p>

                {worker.certifications || worker.profile?.certifications ? (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      Certifications & Training
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {worker.certifications || worker.profile?.certifications}
                    </p>
                  </div>
                ) : null}

                {/* Accessible details toggles (works without client JS) */}
                <div className="space-y-3">
                  <details className="bg-gray-50 rounded-lg p-4 border">
                    <summary className="cursor-pointer font-medium">
                      Details
                    </summary>
                    <div className="mt-3 space-y-3 text-sm">
                      {worker.tools_equipment ||
                      worker.profile?.tools_equipment ? (
                        <div>
                          <h5 className="font-semibold">Tools & Equipment</h5>
                          <p className="text-muted-foreground mt-1 p-3 rounded-md bg-white border">
                            {worker.tools_equipment ||
                              worker.profile?.tools_equipment}
                          </p>
                        </div>
                      ) : null}

                      {worker.transportation ||
                      worker.profile?.transportation ? (
                        <div>
                          <h5 className="font-semibold">Transportation</h5>
                          <div className="mt-1">
                            <Badge variant="outline" className="capitalize">
                              {worker.transportation ||
                                worker.profile?.transportation}
                            </Badge>
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <h5 className="font-semibold">Languages</h5>
                        <p className="text-muted-foreground mt-1">
                          {(
                            worker.languages ||
                            worker.profile?.languages ||
                            []
                          ).join?.(", ") || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 border">
                    <summary className="cursor-pointer font-medium">
                      Skills & Experience
                    </summary>
                    <div className="mt-3 space-y-3">
                      {Array.isArray(worker.skills) &&
                      worker.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {worker.skills.map((skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : Array.isArray(worker.profile?.skills) &&
                        worker.profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {worker.profile.skills.map((skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No skills listed
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-sm text-muted-foreground">
                            Total Jobs
                          </div>
                          <div className="text-xl font-bold mt-1">
                            {worker.total_jobs ??
                              worker.profile?.total_jobs ??
                              0}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-sm text-muted-foreground">
                            Experience
                          </div>
                          <div className="text-xl font-bold mt-1">
                            {worker.years_experience ??
                              worker.profile?.years_experience ??
                              "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 border">
                    <summary className="cursor-pointer font-medium">
                      Availability
                    </summary>
                    <div className="mt-3 space-y-3 text-sm">
                      {Array.isArray(worker.available_days) &&
                      worker.available_days.length > 0 ? (
                        <div>
                          <h5 className="font-semibold">Available Days</h5>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {worker.available_days.map((d: string) => (
                              <Badge
                                key={d}
                                variant="outline"
                                className="capitalize px-3 py-1"
                              >
                                {d}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {worker.available_times && (
                        <div>
                          <h5 className="font-semibold">Available Times</h5>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className="px-3 py-1 capitalize"
                            >
                              {worker.available_times}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {!worker.available_days && !worker.available_times && (
                        <div className="text-sm text-muted-foreground">
                          No availability specified
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            {bookings && bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Who booked and when</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.map((b: any) => {
                      const client = normalizeProfile(b.client);
                      return (
                        <div
                          key={b.id}
                          className="flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {client?.full_name ?? "Client"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {timeAgo(b.created_at)}
                            </div>
                          </div>
                          <div className="text-sm text-right">
                            <div className="font-semibold">
                              ₦
                              {(
                                (b.amount_ngn || 0) + (b.commission_ngn || 0)
                              ).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {b.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <ReviewsDisplay
              reviews={reviews || []}
              averageRating={rating}
              totalReviews={totalReviews}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
