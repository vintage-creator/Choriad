import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Award, Star } from "lucide-react"

interface TrustBadgesProps {
  verificationStatus: string
  rating: number
  totalReviews: number
  completedJobs: number
}

export function TrustBadges({ verificationStatus, rating, totalReviews, completedJobs }: TrustBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {verificationStatus === "verified" && (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          ID Verified
        </Badge>
      )}
      {rating >= 4.5 && totalReviews >= 10 && (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <Star className="h-3 w-3 mr-1" />
          Top Rated
        </Badge>
      )}
      {completedJobs >= 50 && (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          <Award className="h-3 w-3 mr-1" />
          Experienced Pro
        </Badge>
      )}
      {completedJobs >= 100 && (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
          <Shield className="h-3 w-3 mr-1" />
          Elite Provider
        </Badge>
      )}
    </div>
  )
}
