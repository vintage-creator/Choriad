import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Job } from "@/lib/types"
import { TrustBadges } from "@/components/worker/trust-badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface JobDetailsProps {
  job: Job
  worker: any
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  assigned: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function JobDetails({ job, worker }: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/client/dashboard">← Back to Dashboard</Link>
        </Button>
        {job.status === "open" && (
          <Button asChild>
            <Link href={`/client/jobs/${job.id}/edit`}>Edit Task</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <Badge className={statusColors[job.status]}>{job.status.replace("_", " ")}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-muted-foreground">{job.category}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Urgency</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {job.urgency.replace("_", " ")}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {job.location_city}
              {job.location_area && `, ${job.location_area}`}
              {job.location_address && ` - ${job.location_address}`}
            </div>
          </div>

          {(job.budget_min_ngn || job.budget_max_ngn) && (
            <div>
              <h3 className="font-semibold mb-2">Budget</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />₦{job.budget_min_ngn?.toLocaleString() || 0} - ₦
                {job.budget_max_ngn?.toLocaleString() || 0}
              </div>
            </div>
          )}

          {worker && (
            <div>
              <h3 className="font-semibold mb-2">Assigned Worker</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={worker.profiles?.avatar_url || ""} />
                        <AvatarFallback>{worker.profiles?.full_name?.charAt(0) || "W"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{worker.profiles?.full_name || "Worker"}</p>
                        <p className="text-sm text-muted-foreground">Rating: {worker.rating?.toFixed(1) || "N/A"} ★</p>
                        <div className="mt-2">
                          <TrustBadges
                            verificationStatus={worker.verification_status || "pending"}
                            rating={worker.rating || 0}
                            totalReviews={worker.total_reviews || 0}
                            completedJobs={worker.completed_jobs || 0}
                          />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/worker/public-profile/${worker.user_id}`}>View Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
