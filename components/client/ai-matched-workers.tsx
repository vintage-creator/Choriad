"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import { assignWorkerToJob } from "@/app/actions/matching"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrustBadges } from "@/components/worker/trust-badges"

interface WorkerMatch {
  workerId: string
  score: number
  reasoning: string
  strengths: string[]
  considerations: string[]
}

interface AIMatchedWorkersProps {
  jobId: string
}

export function AIMatchedWorkers({ jobId }: AIMatchedWorkersProps) {
  const router = useRouter()
  const [matches, setMatches] = useState<WorkerMatch[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch("/api/ai/match-workers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        const data = await response.json()
        setMatches(data.matches || [])

        // Fetch worker details
        if (data.matches && data.matches.length > 0) {
          const workerIds = data.matches.map((m: WorkerMatch) => m.workerId)
          const workersResponse = await fetch("/api/workers/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerIds }),
          })
          const workersData = await workersResponse.json()
          setWorkers(workersData.workers || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [jobId])

  const handleAssign = async (workerId: string) => {
    setAssigning(workerId)
    const result = await assignWorkerToJob(jobId, workerId)

    if (result.error) {
      alert(result.error)
      setAssigning(null)
    } else {
      router.push("/client/dashboard")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">AI is analyzing available workers...</span>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">No workers available in your area at the moment</p>
          <Button asChild>
            <Link href="/client/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold mb-1">AI-Powered Matching</p>
              <p className="text-sm text-muted-foreground">
                We've analyzed {workers.length} available workers and ranked them based on skills, experience, ratings,
                and your job requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {matches.map((match, index) => {
        const worker = workers.find((w) => w.user_id === match.workerId)
        if (!worker) return null

        return (
          <Card key={match.workerId} className="relative">
            {index === 0 && (
              <div className="absolute -top-3 left-4">
                <Badge className="bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Best Match
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={worker.profile?.avatar_url || ""} />
                    <AvatarFallback>{worker.profile?.full_name?.charAt(0) || "W"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{worker.profile?.full_name}</CardTitle>
                      <Badge variant="secondary" className="text-primary">
                        {match.score}% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {worker.rating.toFixed(1)} ★ ({worker.total_reviews} reviews) • {worker.completed_jobs} jobs
                      completed
                    </p>
                    <TrustBadges
                      verificationStatus={worker.verification_status}
                      rating={worker.rating}
                      totalReviews={worker.total_reviews}
                      completedJobs={worker.completed_jobs}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">₦{worker.hourly_rate_ngn.toLocaleString()}/hr</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Why this match?
                </p>
                <p className="text-sm text-muted-foreground">{match.reasoning}</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Key Strengths
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {match.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {match.considerations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Considerations
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {match.considerations.map((consideration, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleAssign(match.workerId)} disabled={assigning !== null} className="flex-1">
                  {assigning === match.workerId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign to Job"
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/worker/public-profile/${match.workerId}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
