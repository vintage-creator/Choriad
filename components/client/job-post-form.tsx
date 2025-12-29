"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AIJobSuggestions } from "@/components/client/ai-job-suggestions"

/**
 * Choriad service categories (aligned with FeaturesSection)
 */
const categories = [
  { value: "market_runs", label: "Market Runs (Oja Shopping)" },
  { value: "home_cleaning", label: "Home Cleaning" },
  { value: "errands_delivery", label: "Errands & Deliveries (Go-Come)" },
  { value: "tutorial_services", label: "Tutorial Services" },
  { value: "home_chef", label: "Home Chef / Home Cooking" },
  { value: "handyman_services", label: "Handyman Services (Oga)" },
  { value: "event_support", label: "Event Support / Party Help" },
  { value: "elderly_care", label: "Elderly Care / Caregiver" },
  { value: "other", label: "Other / Custom Task" },
]

const cities = ["Apapa", "Alaba", "Badagry", "Owerri", "Oshodi", "Ikeja", "Jakande", "Lekki Phase 1", "Lekki Phase 2", "Surulere", "Sangotedo", "Abuja", "Port Harcourt", "Umuahia"]

const urgencyOptions = [
  { value: "urgent", label: "Urgent (within hours)" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "flexible", label: "Flexible" },
]

interface JobPostFormProps {
  userId: string
}

export function JobPostForm({ userId }: JobPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: "",
    category: "",
    location_city: "",
    budget_max: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formDataObj = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("jobs").insert({
        client_id: userId,
        title: formDataObj.get("title") as string,
        description: formDataObj.get("description") as string,
        category: formDataObj.get("category") as string,
        urgency: formDataObj.get("urgency") as string,

        location_city: formDataObj.get("location_city") as string,
        location_area: formDataObj.get("location_area") as string,
        location_address: formDataObj.get("location_address") as string,

        budget_min_ngn:
          Number.parseInt(formDataObj.get("budget_min") as string) || null,
        budget_max_ngn:
          Number.parseInt(formDataObj.get("budget_max") as string) || null,
      })

      if (error) throw error

      router.push("/client/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Buy groceries from Mile 12 market"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Explain exactly what you need done, timing, special instructions, etc."
              required
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Category + Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Service Category</Label>
              <Select
                name="category"
                required
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select name="urgency" defaultValue="flexible" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location_city">City</Label>
            <Select
              name="location_city"
              required
              onValueChange={(value) =>
                setFormData({ ...formData, location_city: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_area">Area / Neighbourhood</Label>
              <Input
                id="location_area"
                name="location_area"
                placeholder="e.g., Lekki Phase 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Address (Optional)</Label>
              <Input
                id="location_address"
                name="location_address"
                placeholder="Street, building, gate details"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label>Budget (₦)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="budget_min"
                name="budget_min"
                type="number"
                placeholder="Min"
                min="0"
                step="100"
              />
              <Input
                id="budget_max"
                name="budget_max"
                type="number"
                placeholder="Max"
                min="0"
                step="100"
                onChange={(e) =>
                  setFormData({ ...formData, budget_max: e.target.value })
                }
              />
            </div>
          </div>

          {/* AI Suggestions */}
          <AIJobSuggestions
            jobDescription={formData.description}
            category={formData.category}
            location={formData.location_city}
            budget={formData.budget_max}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Posting..." : "Post Task"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
