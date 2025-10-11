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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIJobSuggestions } from "@/components/client/ai-job-suggestions"

const categories = [
  "Grocery Shopping",
  "Home Cleaning",
  "Errands & Delivery",
  "Package Collection",
  "Meal Prep",
  "Handyman Services",
  "Other",
]

const cities = ["Lagos", "Abuja", "Port Harcourt"]

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
        location_city: formDataObj.get("location_city") as string,
        location_area: formDataObj.get("location_area") as string,
        location_address: formDataObj.get("location_address") as string,
        budget_min_ngn: Number.parseInt(formDataObj.get("budget_min") as string) || null,
        budget_max_ngn: Number.parseInt(formDataObj.get("budget_max") as string) || null,
        urgency: formDataObj.get("urgency") as string,
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
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" placeholder="e.g., Weekly grocery shopping" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide details about what you need help with..."
              rows={4}
              required
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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

          <div className="space-y-2">
            <Label htmlFor="location_city">City</Label>
            <Select
              name="location_city"
              required
              onValueChange={(value) => setFormData({ ...formData, location_city: value })}
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
              <Label htmlFor="location_area">Area/Neighborhood</Label>
              <Input id="location_area" name="location_area" placeholder="e.g., Victoria Island" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Address (Optional)</Label>
              <Input id="location_address" name="location_address" placeholder="Specific address" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget (₦)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input id="budget_min" name="budget_min" type="number" placeholder="Min amount" min="0" step="100" />
              </div>
              <div>
                <Input
                  id="budget_max"
                  name="budget_max"
                  type="number"
                  placeholder="Max amount"
                  min="0"
                  step="100"
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                />
              </div>
            </div>
          </div>

          <AIJobSuggestions
            jobDescription={formData.description}
            category={formData.category}
            location={formData.location_city}
            budget={formData.budget_max}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

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
