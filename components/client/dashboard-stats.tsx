"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react";
import type { Job } from "@/lib/types";
import { motion } from "framer-motion";

interface DashboardStatsProps {
  jobs: Job[]
  bookingsCount: number
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
    }
  })
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      icon: Clock,
      label: "Open Tasks",
      value: openJobs,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: completedJobs,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      icon: Calendar,
      label: "Bookings",
      value: bookingsCount,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          custom={index}
          variants={statVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                    style={{ width: `${Math.min((stat.value / Math.max(jobs.length, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}