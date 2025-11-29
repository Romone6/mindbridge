-- -----------------------------------------------------------------------------
-- MINDBRIDGE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- -----------------------------------------------------------------------------

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Waitlist Table
create table public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('patient', 'provider', 'admin')) default 'patient',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Triage Sessions (for the Demo & Real Triage)
create table public.triage_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- Nullable for anon demo
  session_id text not null, -- Client-side generated ID for anon tracking
  risk_score integer, -- 0-100
  summary text,
  status text check (status in ('active', 'completed', 'escalated')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Messages Table (Chat History)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.triage_sessions(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  sentiment_score float, -- Optional sentiment analysis
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS
alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;
alter table public.triage_sessions enable row level security;
alter table public.messages enable row level security;

-- Waitlist: Allow anyone to insert (public form), only admins can view
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

create policy "Only admins can view waitlist" on public.waitlist
  for select using (auth.role() = 'service_role');

-- Profiles: Users can view/edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Triage Sessions: Anon users can insert, Users can view their own
create policy "Anyone can create triage session" on public.triage_sessions
  for insert with check (true);

create policy "Users view own sessions" on public.triage_sessions
  for select using (
    auth.uid() = user_id -- Authenticated users
    or 
    (user_id is null) -- Allow anon access (simplified for demo, refine for prod)
  );

-- Messages: Same as sessions
create policy "Anyone can insert messages" on public.messages
  for insert with check (true);

create policy "Users view own messages" on public.messages
  for select using (true); -- Simplified for demo. In prod, join with triage_sessions to check ownership.

-- -----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
