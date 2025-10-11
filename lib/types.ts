export type UserType = "client" | "worker"

export type VerificationStatus = "pending" | "verified" | "rejected"

export type AvailabilityStatus = "available" | "busy" | "offline"

export type JobStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled"

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"

export type PaymentStatus = "pending" | "paid" | "refunded"

export type Urgency = "urgent" | "today" | "this_week" | "flexible"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: UserType
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Worker {
  id: string
  bio: string | null
  skills: string[]
  hourly_rate_ngn: number | null
  location_city: string
  location_area: string | null
  verification_status: VerificationStatus
  verification_documents: any
  rating: number
  total_jobs: number
  availability_status: AvailabilityStatus
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  location_city: string
  location_area: string | null
  location_address: string | null
  budget_min_ngn: number | null
  budget_max_ngn: number | null
  urgency: Urgency
  status: JobStatus
  assigned_worker_id: string | null
  scheduled_date: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  job_id: string
  client_id: string
  worker_id: string
  status: BookingStatus
  scheduled_date: string
  completion_date: string | null
  amount_ngn: number
  commission_ngn: number
  payment_status: PaymentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}
