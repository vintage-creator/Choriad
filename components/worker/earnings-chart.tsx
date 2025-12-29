// components/worker/earnings-chart.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"
import { useState } from "react"
import { TrendingUp, BarChart3, Calendar } from "lucide-react"

interface MonthlyEarning {
  month: number
  year: number
  amount: number
}

interface EarningsChartProps {
  data: MonthlyEarning[]
}

export function EarningsChart({ data }: EarningsChartProps) {
  const [view, setView] = useState<"year" | "month">("year")

  // Format data for chart
  const formattedData = data.map(item => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    return {
      name: `${monthNames[item.month]} ${item.year}`,
      earnings: item.amount,
      month: monthNames[item.month],
      year: item.year
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            ₦{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Earnings Overview
        </CardTitle>
        <Tabs defaultValue="year" className="w-auto">
          <TabsList>
            <TabsTrigger value="year" onClick={() => setView("year")}>
              <Calendar className="h-4 w-4 mr-2" />
              Year
            </TabsTrigger>
            <TabsTrigger value="month" onClick={() => setView("month")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No earnings data yet</h3>
              <p className="text-gray-600 text-sm">
                Complete your first job to see earnings analytics
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `₦${(value / 1000)}k`}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="earnings" 
                  name="Earnings (₦)"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats */}
        {data.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-sm text-gray-500">Highest Month</div>
              <div className="font-bold text-lg">
                {formattedData.reduce((max, item) => 
                  item.earnings > max.earnings ? item : max
                ).name}
              </div>
              <div className="text-green-600 font-semibold">
                ₦{Math.max(...formattedData.map(d => d.earnings)).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Average Monthly</div>
              <div className="font-bold text-lg">
                ₦{Math.round(formattedData.reduce((sum, item) => sum + item.earnings, 0) / formattedData.length).toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">
                Last {formattedData.length} months
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Growth</div>
              <div className="font-bold text-lg">
                {formattedData.length > 1 ? (
                  <span className="text-green-600">
                    +{Math.round(((formattedData[formattedData.length - 1].earnings - formattedData[0].earnings) / formattedData[0].earnings) * 100)}%
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
              <div className="text-gray-600 text-sm">Since start</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}