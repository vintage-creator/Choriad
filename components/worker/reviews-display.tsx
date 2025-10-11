import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: string
  rating: number
  comment: string
  punctuality: number
  quality: number
  communication: number
  created_at: string
  client: {
    full_name: string
    avatar_url: string | null
  }
}

interface ReviewsDisplayProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function ReviewsDisplay({ reviews, averageRating, totalReviews }: ReviewsDisplayProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">{renderStars(Math.round(averageRating))}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.client.avatar_url || ""} />
                      <AvatarFallback>{review.client.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{review.client.full_name}</p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm mb-3">{review.comment}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      Punctuality: {review.punctuality}/5
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Quality: {review.quality}/5
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Communication: {review.communication}/5
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
