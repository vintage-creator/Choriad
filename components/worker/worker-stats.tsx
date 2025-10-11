import { Card, CardContent } from "@/components/ui/card"
import { Star, Briefcase, DollarSign, TrendingUp } from "lucide-react"
import type { Worker } from "@/lib/types"

interface WorkerStatsProps {
  worker: Worker
  bookingsCount: number
}

export function WorkerStats({ worker, bookingsCount }: WorkerStatsProps) {
  const stats = [
    {
      icon: Star,
      label: "Rating",
      value: worker.rating ? `${worker.rating.toFixed(1)} ★` : "No ratings yet",
      color: "text-yellow-600",
    },
    {
      icon: Briefcase,
      label: "Jobs Completed",
      value: worker.total_jobs,
      color: "text-primary",
    },
    {
      icon: DollarSign,
      label: "Hourly Rate",
      value: worker.hourly_rate_ngn ? `₦${worker.hourly_rate_ngn.toLocaleString()}` : "Negotiable",
      color: "text-green-600",
    },
    {
      icon: TrendingUp,
      label: "Active Bookings",
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
