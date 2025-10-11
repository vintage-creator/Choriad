import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Calendar, DollarSign, Sparkles } from "lucide-react"
import type { Job } from "@/lib/types"

interface JobsListProps {
  jobs: Job[]
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  assigned: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function JobsList({ jobs }: JobsListProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t posted any tasks yet</p>
          <Button asChild>
            <Link href="/client/jobs/new">Post Your First Task</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Tasks</h2>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </div>
                <Badge className={statusColors[job.status]}>{job.status.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location_city}
                  {job.location_area && `, ${job.location_area}`}
                </div>
                {job.budget_max_ngn && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />₦{job.budget_min_ngn?.toLocaleString()} - ₦
                    {job.budget_max_ngn.toLocaleString()}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {job.urgency.replace("_", " ")}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/client/jobs/${job.id}`}>View Details</Link>
                </Button>
                {job.status === "open" && (
                  <>
                    <Button size="sm" asChild>
                      <Link href={`/client/jobs/${job.id}/match`}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Find Workers
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/client/jobs/${job.id}/edit`}>Edit</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
