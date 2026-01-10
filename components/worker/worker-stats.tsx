import { Card, CardContent } from "@/components/ui/card"
import { Star, Briefcase, PiggyBank, TrendingUp } from "lucide-react"

interface WorkerStatsProps {
  worker: any
  bookingsCount: number
  completedJobs: number
  upcomingBookings: number
  totalEarnings: number
}

const formatNGN = (amount: number) => {
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`
  }
  return `₦${amount.toLocaleString()}`
}

export function WorkerStats({
  worker,
  bookingsCount,
  completedJobs,
  upcomingBookings,
  totalEarnings,
}: WorkerStatsProps) {
  const stats = [
    {
      icon: TrendingUp,
      label: "Total Earnings",
      value: formatNGN(totalEarnings),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Star,
      label: "Rating",
      value: worker.rating ? `${worker.rating.toFixed(1)} ★` : "—",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Briefcase,
      label: "Jobs Completed",
      value: completedJobs,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: PiggyBank,
      label: "Hourly Rate",
      value: worker.hourly_rate_ngn
        ? `₦${worker.hourly_rate_ngn.toLocaleString()}`
        : "Flexible",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
