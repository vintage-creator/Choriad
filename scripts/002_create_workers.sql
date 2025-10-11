-- Create workers table for service providers
create table if not exists public.workers (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  skills text[] not null default '{}',
  hourly_rate_ngn integer, -- Nigerian Naira
  location_city text not null,
  location_area text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verification_documents jsonb,
  rating numeric(3, 2) default 0.00,
  total_jobs integer default 0,
  availability_status text not null default 'available' check (availability_status in ('available', 'busy', 'offline')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.workers enable row level security;

-- RLS Policies for workers
create policy "workers_select_all"
  on public.workers for select
  using (true); -- Anyone can view worker profiles

create policy "workers_insert_own"
  on public.workers for insert
  with check (auth.uid() = id);

create policy "workers_update_own"
  on public.workers for update
  using (auth.uid() = id);

create policy "workers_delete_own"
  on public.workers for delete
  using (auth.uid() = id);
