import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, CheckCircle, Clock, Calendar } from "lucide-react"
import type { Job } from "@/lib/types"

interface DashboardStatsProps {
  jobs: Job[]
  bookingsCount: number
}

export function DashboardStats({ jobs, bookingsCount }: DashboardStatsProps) {
  const openJobs = jobs.filter((job) => job.status === "open").length
  const completedJobs = jobs.filter((job) => job.status === "completed").length
  const inProgressJobs = jobs.filter((job) => job.status === "in_progress").length

  const stats = [
    {
      icon: Briefcase,
      label: "Total Tasks",
      value: jobs.length,
      color: "text-primary",
    },
    {
      icon: Clock,
      label: "Open Tasks",
      value: openJobs,
      color: "text-secondary",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: completedJobs,
      color: "text-green-600",
    },
    {
      icon: Calendar,
      label: "Bookings",
      value: bookingsCount,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
