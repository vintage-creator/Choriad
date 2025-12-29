// components/worker/earnings-summary.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
 PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  PieChart
} from "lucide-react"

interface MonthlyEarning {
  month: number
  year: number
  amount: number
}

interface EarningsSummaryProps {
  totalEarnings: number
  completedJobs: number
  avgPerJob: number
  monthlyData: MonthlyEarning[]
}

export function EarningsSummary({ 
  totalEarnings, 
  completedJobs, 
  avgPerJob,
  monthlyData 
}: EarningsSummaryProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const currentMonthEarnings = monthlyData.find(
    m => m.month === currentMonth && m.year === currentYear
  )?.amount || 0
  
  const lastMonthEarnings = monthlyData.find(
    m => m.month === (currentMonth === 0 ? 11 : currentMonth - 1) && 
         m.year === (currentMonth === 0 ? currentYear - 1 : currentYear)
  )?.amount || 0
  
  const monthOverMonthChange = lastMonthEarnings 
    ? ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
    : 0
  
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  
  const yearlyTarget = 500000 // ₦500,000 target
  const progressToTarget = (totalEarnings / yearlyTarget) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yearly Target Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Yearly Target Progress</span>
            <span className="font-semibold">{Math.round(progressToTarget)}%</span>
          </div>
          <Progress value={Math.min(progressToTarget, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₦0</span>
            <span>₦{yearlyTarget.toLocaleString()}</span>
          </div>
        </div>

        {/* Month-over-Month Change */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-xl font-bold">₦{currentMonthEarnings.toLocaleString()}</p>
          </div>
          <div className={`flex items-center gap-1 ${monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthOverMonthChange >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-semibold">
              {monthOverMonthChange >= 0 ? '+' : ''}{Math.round(monthOverMonthChange)}%
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-600">Completed Jobs</p>
            </div>
            <p className="text-lg font-bold">{completedJobs}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-600">Avg. per Job</p>
            </div>
            <p className="text-lg font-bold">₦{avgPerJob.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Monthly Breakdown
          </h4>
          <div className="space-y-2">
            {monthlyData.slice(-3).map((month, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {monthNames[month.month]} {month.year}
                </span>
                <span className="font-semibold">₦{month.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-2">Tips to Increase Earnings</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
              Complete your profile verification
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
              Add portfolio photos to attract clients
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
              Request reviews after completed jobs
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt=1.5 flex-shrink-0" />
              Apply for jobs within 1 hour of posting
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}