// components/client/review-form.tsx 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { createReview } from "@/app/actions/review";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

interface ReviewFormProps {
  booking: {
    id: string;
    job_id: string; 
    worker: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    };
    job: {
      title: string;
      description?: string;
    };
  };
}

export function ReviewForm({ booking }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [quality, setQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rating || !punctuality || !quality || !communication) {
      toast.error("Please rate all categories");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("booking_id", booking.id);
    formData.append("job_id", booking.job_id);
    formData.append("worker_id", booking.worker.id);
    formData.append("rating", rating.toString());
    formData.append("punctuality", punctuality.toString());
    formData.append("quality", quality.toString());
    formData.append("communication", communication.toString());
    formData.append("comment", comment);

    const result = await createReview(formData);

    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Review submitted successfully!");
      setTimeout(() => {
        router.push("/client/bookings");
      }, 1500);
    }
  };

  const RatingStars = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => {
    const [hovered, setHovered] = useState(0);

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
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
                  star <= (hovered || value)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {value === 0 && "Click to rate"}
          {value === 1 && "Poor"}
          {value === 2 && "Below Average"}
          {value === 3 && "Average"}
          {value === 4 && "Good"}
          {value === 5 && "Excellent"}
        </p>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-white">
            <AvatarImage src={booking.worker.avatar_url || ""} />
            <AvatarFallback className="text-lg">
              {booking.worker.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{booking.worker.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{booking.job.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <RatingStars 
              value={rating} 
              onChange={setRating} 
              label="Overall Rating" 
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid gap-6 md:grid-cols-3">
            <RatingStars
              value={punctuality}
              onChange={setPunctuality}
              label="⏰ Punctuality"
            />
            <RatingStars 
              value={quality} 
              onChange={setQuality} 
              label="✨ Quality" 
            />
            <RatingStars
              value={communication}
              onChange={setCommunication}
              label="💬 Communication"
            />
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience with this service provider. What did they do well? What could be improved?"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters ({comment.length}/20)
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={
                !rating ||
                !punctuality ||
                !quality ||
                !communication ||
                comment.length < 20 ||
                isSubmitting
              }
              className="flex-1 bg-gradient-to-r from-primary to-blue-600 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className=" cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}