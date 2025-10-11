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
import { Checkbox } from "@/components/ui/checkbox"

const skillOptions = [
  "Grocery Shopping",
  "Home Cleaning",
  "Errands & Delivery",
  "Package Collection",
  "Meal Prep",
  "Handyman Services",
  "Laundry",
  "Pet Care",
  "Gardening",
  "Moving Help",
]

const cities = ["Lagos", "Abuja", "Port Harcourt"]

interface WorkerSetupFormProps {
  userId: string
}

export function WorkerSetupForm({ userId }: WorkerSetupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (selectedSkills.length === 0) {
      setError("Please select at least one skill")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("workers").insert({
        id: userId,
        bio: formData.get("bio") as string,
        skills: selectedSkills,
        hourly_rate_ngn: Number.parseInt(formData.get("hourly_rate") as string) || null,
        location_city: formData.get("location_city") as string,
        location_area: formData.get("location_area") as string,
      })

      if (error) throw error

      router.push("/worker/dashboard")
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
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell clients about your experience and what makes you great at what you do..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Skills & Services (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <Label htmlFor={skill} className="font-normal cursor-pointer">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (₦)</Label>
            <Input id="hourly_rate" name="hourly_rate" type="number" placeholder="e.g., 2000" min="0" step="100" />
            <p className="text-sm text-muted-foreground">Optional - you can negotiate rates per task</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <Select name="location_city" required>
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

            <div className="space-y-2">
              <Label htmlFor="location_area">Area/Neighborhood</Label>
              <Input id="location_area" name="location_area" placeholder="e.g., Victoria Island" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Profile..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
