# Choriad - AI-Powered Service Provider Platform

> Connecting busy professionals in Nigerian cities with verified service providers through intelligent matching and automated workflows.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Flutterwave](https://img.shields.io/badge/Flutterwave-Payments-orange)](https://flutterwave.com/)

## 🌟 Overview

Choriad is a comprehensive platform that revolutionizes how busy individuals find and hire service providers. Built with AI at its core, Choriad automates the entire hiring process - from finding the perfect worker to processing payments after job completion.

### What Makes Choriad Different?

- **AI Agent as Super Admin**: Our AI doesn't just match workers—it scouts, negotiates, books, and manages the entire job lifecycle
- **Automated Payments**: Escrow-based payment system with automatic worker payouts upon job completion
- **Trust-First Approach**: Comprehensive verification system with ID checks, badges, and ratings
- **Nigerian-Focused**: Built specifically for Nigerian cities with local payment integration (Flutterwave)

## 🎯 Key Features

### For Clients

#### 🤖 AI-Powered Job Management
- **Intelligent Worker Scouting**: AI analyzes thousands of workers to find perfect matches based on skills, ratings, location, and availability
- **Automated Negotiation**: AI handles price negotiations within your budget
- **Smart Booking**: One-click booking with AI handling all coordination
- **Post-Completion Processing**: AI manages reviews and payment releases

#### 💼 Job Posting & Management
- Create detailed task requests with location, budget, and urgency
- Real-time job status tracking (open → assigned → in progress → completed)
- View worker applications with detailed profiles
- Manage multiple jobs from a unified dashboard

#### 💳 Secure Payment System
- Escrow-based payments via Flutterwave
- Automatic 15% platform commission
- Worker payouts processed after job completion
- Full transaction history and receipts

#### ⭐ Review & Trust
- Rate workers on punctuality, quality, and communication
- View comprehensive worker profiles with verification badges
- Access worker history and previous client reviews

### For Workers

#### 📋 Profile & Portfolio
- Showcase skills, experience, and hourly rates
- Upload verification documents (ID, certifications)
- Display profile pictures and social media links
- Track earnings and completed jobs

#### 🔍 Job Discovery
- Browse jobs with AI-powered relevance scoring
- Filter by location, budget, and urgency
- Apply with custom proposals and cover letters
- Receive instant notifications for relevant jobs

#### 💰 Earnings & Payments
- Track total earnings and pending payouts
- Automatic bank transfers upon job completion
- Detailed transaction history
- Performance analytics and ratings

#### 🏆 Verification & Badges
- **ID Verified**: Complete KYC verification
- **Top Rated**: 4.5+ stars with 10+ reviews
- **Experienced Pro**: 50+ completed jobs
- **Elite Provider**: 100+ jobs completed
- **Fast Responder**: Quick application responses

### Admin Dashboard

#### 📊 Platform Analytics
- Total revenue tracking (15% commission)
- Active workers and client statistics
- Pending payouts overview
- Job completion rates

#### 💸 Payout Management
- View all pending worker payouts
- Process bank transfers via Flutterwave
- Track payment references and statuses
- Bulk payout processing

#### 👥 User Management
- Worker verification approvals
- View all transactions
- Dispute resolution
- Platform health monitoring

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Storage**: Supabase Storage (file uploads)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js Server Actions & Route Handlers

### AI & Automation
- **AI SDK**: Gemini AI SDK
- **Models**: Gemini 3 flash-preview for worker matching and negotiation
- **Embeddings**: Vector search for skill matching

### Payments
- **Provider**: Flutterwave
- **Features**: Charges, Transfers, Webhooks
- **Security**: Escrow system, signature verification
- **Banks**: All major Nigerian banks supported

### DevOps
- **Hosting**: Vercel (Next.js)
- **Database**: Supabase Cloud
- **CDN**: Cloudflare
- **Monitoring**: Vercel Analytics + Supabase Logs

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+ 
npm or yarn
Supabase account
Flutterwave account
OpenAI API key
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/choriad.git
cd choriad
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_secret

# Gemini API
GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up database**

Run the SQL scripts in order:

```bash
# In your Supabase SQL Editor, run:
scripts/01_create_tables.sql
scripts/02_create_policies.sql
scripts/03_create_triggers.sql
scripts/04_create_functions.sql
```

Or use the provided setup script:

```bash
npm run db:setup
```

5. **Make yourself an admin**

```sql
UPDATE profiles 
SET user_type = 'admin', is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

6. **Start development server**

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
choriad/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── job.ts           # Job CRUD operations
│   │   ├── booking.ts       # Booking management
│   │   ├── admin.ts         # Admin operations & payouts
│   │   └── worker.ts        # Worker profile updates
│   ├── api/
│   │   ├── ai/              # AI endpoints
│   │   │   ├── match/       # Worker matching
│   │   │   └── negotiate/   # Price negotiation
│   │   └── flutterwave/     # Payment webhooks
│   ├── auth/                # Authentication pages
│   ├── client/              # Client dashboard & features
│   ├── worker/              # Worker dashboard & features
│   ├── admin/               # Admin dashboard
│   └── (landing)/           # Landing page
├── components/
│   ├── client/              # Client components
│   ├── worker/              # Worker components
│   ├── admin/               # Admin components
│   ├── landing/             # Landing sections
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── supabase/            # Supabase utilities
│   ├── flutterwave.ts       # Flutterwave SDK
│   ├── ai/                  # AI utilities
│   └── types.ts             # TypeScript definitions
├── scripts/                 # Database migration scripts
└── public/                  # Static assets
```

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User accounts (auto-created via trigger)
- `id` (UUID, PK) - Links to Supabase Auth
- `email`, `full_name`, `phone`
- `user_type` - 'client', 'worker', or 'admin'
- `avatar_url`, timestamps

#### `workers`
Service provider profiles
- `id` (UUID, PK, FK → profiles)
- Skills, hourly rate, location
- Verification status and documents
- Bank account details
- Social media links
- Stats: rating, completed_jobs, total_earnings

#### `jobs`
Task postings from clients
- Client details, title, description
- Category, location, budget range
- Urgency level (today, this_week, flexible)
- Status flow: open → assigned → in_progress → completed
- `assigned_worker_id`, `final_amount_ngn`

#### `applications`
Worker applications to jobs
- Worker proposal and cover letter
- Proposed amount
- Status: applied → hired/rejected

#### `bookings`
Confirmed job assignments
- Job and worker references
- Payment tracking (client → escrow → worker)
- Scheduled date and time
- Payment references (Flutterwave)

#### `reviews`
Client feedback on completed jobs
- Overall rating + detailed ratings
- Written comments
- Public visibility

#### `admin_audit_log`
Admin action tracking for compliance

### Security

All tables protected by Row Level Security (RLS):
- Users access only their own data
- Workers view public job listings
- Clients view assigned workers only
- Admins have full read access
- Reviews are publicly readable

## 🤖 AI Features

### 1. Intelligent Worker Matching

**Endpoint**: `/api/ai/match`

The AI analyzes:
- **Skill Alignment**: Matches worker skills to job requirements
- **Experience Level**: Years of experience and completed jobs
- **Rating & Reviews**: Historical performance metrics
- **Location Proximity**: Distance from job location
- **Availability**: Schedule compatibility
- **Budget Fit**: Hourly rate vs. job budget
- **Verification Status**: Trust and safety scores

Returns top 5 matches with:
- Match score (0-100)
- Detailed reasoning
- Key strengths
- Potential concerns
- Recommended hiring decision

### 2. Automated Negotiation

**Endpoint**: `/api/ai/negotiate`

AI handles:
- Counter-offer suggestions within budget
- Market rate analysis
- Worker experience justification
- Compromise strategies
- Final price recommendations

### 3. Smart Booking Assistant

Features:
- Schedules jobs based on worker availability
- Suggests optimal start times
- Handles client-worker communication
- Sends reminders and notifications

### 4. Post-Job Processing

AI automation:
- Prompts client for review
- Analyzes job completion quality
- Processes payment release
- Suggests worker for future jobs

## 💳 Payment Flow

### Client Payment (Escrow)

1. **Job Creation**: Client posts job with budget
2. **Worker Selection**: Client hires a worker
3. **Payment**: Client pays total amount + 15% fee
4. **Escrow**: Funds held securely by Flutterwave
5. **Webhook**: `charge.completed` confirms payment
6. **Status Update**: Booking marked as "paid"
7. **Worker Notified**: Worker can start the job

### Worker Payout

1. **Job Completion**: Worker completes the job
2. **Client Review**: Client marks job as done
3. **Admin Processing**: Admin initiates payout
4. **Bank Transfer**: Flutterwave transfers 85% to worker
5. **Webhook**: `transfer.completed` confirms payout
6. **Status Update**: Booking marked as "worker_paid"
7. **Worker Notified**: Payment confirmation sent

### Commission Structure

- **Platform Fee**: 15% of job amount
- **Worker Payout**: 85% of job amount
- **Example**: ₦20,000 job → ₦3,000 platform fee, ₦17,000 to worker

## 🔐 Security & Trust

### Authentication
- Email/password with Supabase Auth
- OAuth providers (Google, etc.)
- Row Level Security (RLS) on all tables
- JWT-based session management

### Payment Security
- PCI-compliant payment processing
- Webhook signature verification
- Escrow-based fund holding
- Automatic refunds on disputes

### Data Protection
- HTTPS encryption in transit
- Database encryption at rest
- API rate limiting
- CORS configuration

### Verification System
- ID document upload and verification
- Phone number verification
- Email verification required
- Background checks (coming soon)

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Environment variables are managed in Vercel dashboard.

### Environment Configuration

Ensure these are set in production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Flutterwave (LIVE keys)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE-xxx
FLUTTERWAVE_SECRET_HASH=xxx

# Gemini
GEMINI_API_KEY

# App
NEXT_PUBLIC_APP_URL=https://choriad.com
```

### Post-Deployment Checklist

- [ ] Set up Flutterwave webhook: `https://choriad.com/api/flutterwave/webhook`
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN caching
- [ ] Test payment flows end-to-end
- [ ] Verify webhook deliveries
- [ ] Set up database backups
- [ ] Configure SSL certificate

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Payment Flows

**Flutterwave Test Cards:**
```
Card: 5531 8866 5214 2950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

**Test Bank Account:**
```
Bank: Access Bank
Account: 0690000031
```

### Test Webhook Locally

Use ngrok:
```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# Use ngrok URL in Flutterwave webhook settings
```

## 📊 Monitoring

### Logs
- **Application**: Vercel deployment logs
- **Database**: Supabase logs dashboard
- **Payments**: Flutterwave transaction logs

### Analytics
- Vercel Web Analytics
- Supabase dashboard metrics
- Custom admin dashboard

### Alerts
- Failed payments → Email notification
- Webhook failures → Slack alert
- Database errors → Sentry

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

Quick start:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 API Documentation

### Server Actions

**Job Management**
```typescript
createJob(data: JobFormData) → Promise<{ success: boolean }>
updateJobStatus(jobId: string, status: string) → Promise<void>
deleteJob(jobId: string) → Promise<void>
```

**Worker Operations**
```typescript
updateWorkerProfile(data: WorkerProfile) → Promise<void>
applyToJob(jobId: string, proposal: string) → Promise<void>
```

**Admin Operations**
```typescript
processWorkerPayout(params: PayoutParams) → Promise<{ success: boolean }>
verifyAdminAccess() → Promise<{ isAdmin: boolean }>
```

### REST Endpoints

**AI Matching**
```
POST /api/ai/match
Body: { jobId: string }
Response: { matches: WorkerMatch[] }
```

**Webhooks**
```
POST /api/flutterwave/webhook
Headers: { "verif-hash": string }
Body: FlutterwaveEvent
```

## 🐛 Troubleshooting

### Common Issues

**Webhook not received:**
- Check Flutterwave webhook logs
- Verify webhook URL is accessible
- Confirm secret hash matches

**Payment fails:**
- Check API keys are LIVE (not TEST)
- Verify bank account details
- Check Flutterwave transaction status

**Database errors:**
- Review RLS policies
- Check user permissions
- Verify foreign key relationships

## 📄 License

Proprietary - All rights reserved © 2025 Choriad

## 👥 Team

- Product Lead: Israel Abazie

## 📞 Support

- Email: support@choriad.com
- Slack: #choriad-support
- Documentation: https://docs.choriad.com

---

Built with ❤️ in Nigeria
