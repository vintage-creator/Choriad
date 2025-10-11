"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { createReview } from "@/app/actions/review"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ReviewFormProps {
  booking: {
    id: string
    worker: {
      id: string
      full_name: string
      avatar_url: string | null
    }
    job: {
      title: string
    }
  }
}

export function ReviewForm({ booking }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [punctuality, setPunctuality] = useState(0)
  const [quality, setQuality] = useState(0)
  const [communication, setCommunication] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append("booking_id", booking.id)
    formData.append("worker_id", booking.worker.id)
    formData.append("rating", rating.toString())
    formData.append("punctuality", punctuality.toString())
    formData.append("quality", quality.toString())
    formData.append("communication", communication.toString())

    const result = await createReview(formData)

    if (result.error) {
      alert(result.error)
      setIsSubmitting(false)
    } else {
      router.push("/client/bookings")
    }
  }

  const RatingStars = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (value: number) => void
    label: string
  }) => {
    const [hovered, setHovered] = useState(0)

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={booking.worker.avatar_url || ""} />
            <AvatarFallback>{booking.worker.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{booking.worker.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{booking.job.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RatingStars value={rating} onChange={setRating} label="Overall Rating" />

          <div className="grid gap-6 md:grid-cols-3">
            <RatingStars value={punctuality} onChange={setPunctuality} label="Punctuality" />
            <RatingStars value={quality} onChange={setQuality} label="Quality" />
            <RatingStars value={communication} onChange={setCommunication} label="Communication" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Share your experience with this service provider..."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!rating || !punctuality || !quality || !communication || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
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
