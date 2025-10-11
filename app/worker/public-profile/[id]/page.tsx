import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReviewsDisplay } from "@/components/worker/reviews-display"
import { CheckCircle, MapPin, DollarSign, Star } from "lucide-react"
import Link from "next/link"

export default async function PublicWorkerProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: worker } = await supabase
    .from("workers")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("user_id", id)
    .single()

  if (!worker) {
    notFound()
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(full_name, avatar_url)
    `)
    .eq("worker_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="font-bold text-xl text-primary">Choraid</div>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={worker.profile.avatar_url || ""} />
                    <AvatarFallback className="text-3xl">{worker.profile.full_name?.charAt(0) || "W"}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mb-2">{worker.profile.full_name}</h1>
                  {worker.verification_status === "verified" && (
                    <Badge className="mb-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{worker.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">({worker.total_reviews} reviews)</span>
                  </div>
                  <div className="w-full space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {worker.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />₦{worker.hourly_rate_ngn.toLocaleString()}/hr
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{worker.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">Years of Experience</p>
                    <p className="text-muted-foreground">{worker.years_of_experience} years</p>
                  </div>
                  <div>
                    <p className="font-semibold">Completed Jobs</p>
                    <p className="text-muted-foreground">{worker.completed_jobs} tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ReviewsDisplay reviews={reviews || []} averageRating={worker.rating} totalReviews={worker.total_reviews} />
          </div>
        </div>
      </main>
    </div>
  )
}
