// ---------- Shared Enums / Unions ----------

export type UserType = "client" | "worker"

export type VerificationStatus = "pending" | "verified" | "rejected"

export type AvailabilityStatus = "available" | "busy" | "offline"

export type JobStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "refunded"

export type Urgency = "urgent" | "today" | "this_week" | "flexible"

// ---------- Profile ----------

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

// ---------- Worker ----------

export interface Worker {
  id: string
  profile_id: string

  // personal
  bio: string | null
  phone_number: string | null
  years_experience: string | null

  // services
  skills: string[]
  hourly_rate_ngn: number | null
  certifications: string | null
  tools_equipment: string | null
  transportation: string | null

  // availability
  availability_status: AvailabilityStatus
  available_days: string[]
  available_times: string | null

  // location
  location_city: string
  location_area: string | null

  // verification
  verification_status: VerificationStatus
  id_type: string | null
  id_number: string | null
  verification_documents: Record<string, unknown> | null

  // stats
  rating: number
  total_jobs: number

  // social
  facebook_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  linkedin_url: string | null

  // timestamps
  created_at: string
  updated_at: string
}

// ---------- Job ----------

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

// ---------- Booking ----------

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

// ---------- Review ----------

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

export type NotificationType = 
  | 'new_job' 
  | 'booking_request' 
  | 'booking_confirmed' 
  | 'booking_cancelled'
  | 'payment_received'
  | 'payment_pending'
  | 'review_received'
  | 'system_alert'
  | 'profile_verified'
  | 'reminder';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_jobs: boolean;
  email_bookings: boolean;
  email_payments: boolean;
  push_jobs: boolean;
  push_bookings: boolean;
  push_payments: boolean;
  push_reviews: boolean;
}