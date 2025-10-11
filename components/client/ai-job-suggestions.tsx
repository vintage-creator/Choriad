"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface AIJobSuggestionsProps {
  jobDescription: string
  category: string
  location: string
  budget: string
}

export function AIJobSuggestions({ jobDescription, category, location, budget }: AIJobSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGetSuggestions = async () => {
    if (!jobDescription || !category) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/suggest-workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          category,
          location,
          budget,
        }),
      })

      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      console.error("[v0] Error getting suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!jobDescription || !category) return null

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        {!suggestions ? (
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Get AI-Powered Tips</p>
                <p className="text-sm text-muted-foreground">
                  Get personalized suggestions for finding the right service provider
                </p>
              </div>
            </div>
            <Button onClick={handleGetSuggestions} disabled={loading} variant="secondary">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Tips
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-2">AI Suggestions</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{suggestions}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
