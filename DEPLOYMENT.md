# Deployment Guide

## Vercel Deployment

This project is optimized for deployment on Vercel.

### Prerequisites

1. Vercel account
2. Supabase project
3. Stripe account

### Steps

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel
   - Connect the repository

2. **Configure Integrations**
   - Add Supabase integration in Vercel
   - Add Stripe integration in Vercel
   - Environment variables are automatically configured

3. **Run Database Migrations**
   - Execute SQL scripts in Supabase dashboard
   - Or use the v0 script runner
   - Scripts are in `/scripts` folder

4. **Configure Stripe**
   - Set up products and pricing
   - Configure webhooks (if needed)
   - Test payment flow

5. **Deploy**
   - Vercel automatically deploys on push
   - Preview deployments for branches
   - Production deployment from main branch

### Environment Variables

The following are automatically configured via integrations:

**Supabase:**
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**AI (via Vercel AI Gateway):**
- Automatically configured, no API key needed

### Post-Deployment

1. Test authentication flow
2. Create test worker and client accounts
3. Post a test job
4. Test AI matching
5. Complete a test booking
6. Test payment flow
7. Leave a test review

## Database Migrations

Execute in order:
1. `001_create_profiles.sql` - User profiles table
2. `002_create_workers.sql` - Workers table
3. `003_create_jobs.sql` - Jobs table
4. `004_create_bookings.sql` - Bookings table
5. `005_create_reviews.sql` - Reviews table
6. `006_create_profile_trigger.sql` - Auto-create profiles

## Monitoring

- Check Vercel Analytics for performance
- Monitor Supabase for database health
- Review Stripe dashboard for payments
- Check AI SDK usage in Vercel dashboard

## Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure middleware is configured

### Payment Issues
- Verify Stripe keys
- Check webhook configuration
- Review Stripe logs

### AI Matching Issues
- Check AI SDK configuration
- Verify model availability
- Review API logs in Vercel
