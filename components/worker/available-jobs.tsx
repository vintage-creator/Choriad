"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, DollarSign, Sparkles } from "lucide-react"
import { useState } from "react"

interface Job {
  id: string
  title: string
  description: string
  category: string
  location_city: string
  location_area: string | null
  budget_min_ngn: number | null
  budget_max_ngn: number | null
  urgency: string
  created_at: string
  profiles: {
    full_name: string | null
  }
}

interface AvailableJobsProps {
  jobs: Job[]
  workerSkills: string[]
}

export function AvailableJobs({ jobs, workerSkills }: AvailableJobsProps) {
  const [filter, setFilter] = useState<"all" | "matched">("all")

  // Simple matching: check if job category matches any worker skill
  const matchedJobs = jobs.filter((job) => workerSkills.includes(job.category))

  const displayJobs = filter === "matched" ? matchedJobs : jobs

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">No available tasks in your area at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Available Tasks</h2>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All ({jobs.length})
          </Button>
          <Button variant={filter === "matched" ? "default" : "outline"} size="sm" onClick={() => setFilter("matched")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Matched ({matchedJobs.length})
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {displayJobs.map((job) => {
          const isMatched = workerSkills.includes(job.category)
          return (
            <Card key={job.id} className={isMatched ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {isMatched && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  </div>
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Posted by {job.profiles?.full_name || "Client"}</p>
                  <Button size="sm">Express Interest</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
