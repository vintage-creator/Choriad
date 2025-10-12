# Choriad - Service Provider Platform

Choriad is a comprehensive platform connecting busy individuals in Nigerian cities with verified service providers for everyday tasks and lifestyle support.

## Features

### For Clients
- **Job Posting**: Create detailed task requests with location, budget, and urgency
- **AI-Powered Matching**: Get intelligent worker recommendations based on skills, ratings, and availability
- **Secure Payments**: Pay through Stripe with automatic 15% platform commission
- **Review System**: Rate and review service providers after job completion
- **Real-time Tracking**: Monitor job status from posting to completion

### For Workers
- **Profile Management**: Showcase skills, experience, and rates
- **Job Discovery**: Browse available tasks with AI-powered matching
- **Verification System**: Build trust with ID verification and badges
- **Earnings Tracking**: Monitor bookings and completed jobs
- **Rating System**: Build reputation through client reviews

### Platform Features
- **Dual Authentication**: Separate flows for clients and workers
- **Trust & Safety**: Verification badges, ratings, and reviews
- **AI Agent**: Intelligent matching and suggestions powered by OpenAI
- **Payment Processing**: Secure Stripe integration with commission handling
- **Database**: PostgreSQL via Supabase with Row Level Security

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: Vercel AI SDK with OpenAI
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (already configured in Vercel):
   - Supabase credentials
   - Stripe API keys
   - OpenAI API key (via Vercel AI Gateway)

4. Run database migrations:
   - Execute SQL scripts in the `scripts/` folder in order
   - These create tables, RLS policies, and triggers

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Database Schema

### Core Tables

- **profiles**: User profiles (auto-created via trigger)
- **workers**: Worker-specific data (skills, rates, verification)
- **jobs**: Task postings from clients
- **bookings**: Confirmed job assignments
- **reviews**: Client feedback on completed jobs

### Security

All tables use Row Level Security (RLS) policies to ensure:
- Users can only access their own data
- Workers can view open jobs in their location
- Clients can view assigned workers
- Reviews are public but only writable by clients

## Key Routes

### Client Routes
- `/client/dashboard` - Main dashboard with posted jobs
- `/client/jobs/new` - Create new job posting
- `/client/jobs/[id]` - View job details
- `/client/jobs/[id]/match` - AI-powered worker matching
- `/client/bookings` - View all bookings
- `/client/bookings/[id]/pay` - Payment page
- `/client/bookings/[id]/review` - Leave review

### Worker Routes
- `/worker/setup` - Initial profile setup
- `/worker/dashboard` - Main dashboard with available jobs
- `/worker/profile` - Edit profile
- `/worker/bookings` - View assigned bookings
- `/worker/public-profile/[id]` - Public profile view

### Public Routes
- `/` - Landing page
- `/auth/login` - Login
- `/auth/sign-up` - Sign up with user type selection

## AI Features

### Worker Matching
The AI matching agent analyzes:
- Skill alignment with job requirements
- Worker experience and ratings
- Budget compatibility
- Location and availability
- Verification status

Returns top 5 matches with:
- Match score (0-100)
- Reasoning for the match
- Key strengths
- Considerations for the client

### Job Suggestions
Provides clients with:
- What to look for in service providers
- Typical pricing expectations
- Important questions to ask
- Tips for successful bookings

## Payment Flow

1. Client posts job
2. AI suggests matched workers
3. Client assigns worker to job
4. Booking created with "pending" payment status
5. Client pays via Stripe
6. Platform takes 15% commission
7. Worker completes job
8. Client leaves review

## Trust & Safety

### Verification Badges
- **ID Verified**: Worker has completed KYC
- **Top Rated**: 4.5+ rating with 10+ reviews
- **Experienced Pro**: 50+ completed jobs
- **Elite Provider**: 100+ completed jobs

### Review System
- Overall rating (1-5 stars)
- Detailed ratings: Punctuality, Quality, Communication
- Written feedback
- Public display on worker profiles

## Development

### Project Structure
\`\`\`
app/
├── actions/          # Server actions
├── api/             # API routes (AI endpoints)
├── auth/            # Authentication pages
├── client/          # Client dashboard & features
├── worker/          # Worker dashboard & features
components/
├── client/          # Client-specific components
├── worker/          # Worker-specific components
├── landing/         # Landing page sections
├── ui/              # shadcn/ui components
lib/
├── supabase/        # Supabase client utilities
├── stripe.ts        # Stripe configuration
├── types.ts         # TypeScript types
scripts/             # Database migration scripts
\`\`\`

## Contributing

This is a production application. For feature requests or bug reports, please contact the development team.

## License

Proprietary - All rights reserved
