-- Create bookings table for confirmed job assignments
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date timestamptz not null,
  completion_date timestamptz,
  amount_ngn integer not null,
  commission_ngn integer not null, -- Platform commission (15%)
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.bookings enable row level security;

-- RLS Policies for bookings
create policy "bookings_select_own"
  on public.bookings for select
  using (
    auth.uid() = client_id 
    or auth.uid() = worker_id
  );

create policy "bookings_insert_client"
  on public.bookings for insert
  with check (auth.uid() = client_id);

create policy "bookings_update_involved"
  on public.bookings for update
  using (
    auth.uid() = client_id 
    or auth.uid() = worker_id
  );
