import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Clock, CheckCircle } from "lucide-react"

export function AIAgentCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Try Our AI Agent</CardTitle>
            <CardDescription>Let AI find and book workers for you automatically</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Instant Matching:</span> AI analyzes your needs and finds the best workers
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Save Time:</span> No more browsing profiles - just describe what you need
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Auto-Booking:</span> AI handles the entire booking process for you
            </div>
          </div>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/client/ai-agent">
            <Sparkles className="mr-2 h-4 w-4" />
            Chat with AI Agent
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
