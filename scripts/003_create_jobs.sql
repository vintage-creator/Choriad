-- Create jobs table for service requests
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  location_city text not null,
  location_area text,
  location_address text,
  budget_min_ngn integer,
  budget_max_ngn integer,
  urgency text not null default 'flexible' check (urgency in ('urgent', 'today', 'this_week', 'flexible')),
  status text not null default 'open' check (status in ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_worker_id uuid references public.workers(id) on delete set null,
  scheduled_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.jobs enable row level security;

-- RLS Policies for jobs
create policy "jobs_select_own_or_assigned"
  on public.jobs for select
  using (
    auth.uid() = client_id 
    or auth.uid() = assigned_worker_id
  );

-- Workers can view open jobs
create policy "jobs_select_open_for_workers"
  on public.jobs for select
  using (status = 'open');

create policy "jobs_insert_own"
  on public.jobs for insert
  with check (auth.uid() = client_id);

create policy "jobs_update_own"
  on public.jobs for update
  using (auth.uid() = client_id);

create policy "jobs_delete_own"
  on public.jobs for delete
  using (auth.uid() = client_id);
