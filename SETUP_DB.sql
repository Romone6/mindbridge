-- -----------------------------------------------------------------------------
-- MINDBRIDGE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- -----------------------------------------------------------------------------

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Waitlist Table
create table if not exists public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('patient', 'provider', 'admin')) default 'patient',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Triage Sessions (for the Demo & Real Triage)
create table if not exists public.triage_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- Nullable for anon demo
  session_id text not null, -- Client-side generated ID for anon tracking
  risk_score integer, -- 0-100
  summary text,
  status text check (status in ('active', 'completed', 'escalated')) default 'active',
  patient_context jsonb, -- Stores age, context, concern from pre-chat form
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Messages Table (Chat History)
create table if not exists public.messages (
   id uuid default uuid_generate_v4() primary key,
   session_id uuid references public.triage_sessions(id) on delete cascade not null,
   role text check (role in ('user', 'assistant', 'system')) not null,
   content text not null,
   sentiment_score float, -- Optional sentiment analysis
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Clinics Table
create table if not exists public.clinics (
   id uuid default uuid_generate_v4() primary key,
   name text not null,
   owner_id uuid references public.profiles(id) on delete set null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Clinic Memberships Table
create table if not exists public.clinic_memberships (
   id uuid default uuid_generate_v4() primary key,
   clinic_id uuid references public.clinics(id) on delete cascade not null,
   user_id uuid references public.profiles(id) on delete cascade not null,
   role text check (role in ('OWNER', 'CLINICIAN', 'STAFF', 'READ_ONLY')) default 'CLINICIAN',
   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
   unique(clinic_id, user_id)
);

-- 8. Create Patient Links Table
create table if not exists public.patient_links (
   id uuid default uuid_generate_v4() primary key,
   clinic_id uuid references public.clinics(id) on delete cascade not null,
   link_token text not null unique,
   expires_at timestamp with time zone,
   created_by uuid references public.profiles(id) on delete set null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create Patients Table
create table if not exists public.patients (
   id uuid default uuid_generate_v4() primary key,
   clinic_id uuid references public.clinics(id) on delete cascade not null,
   patient_ref text not null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
   unique(clinic_id, patient_ref)
);

-- 10. Create Intakes Table
create table if not exists public.intakes (
   id uuid default uuid_generate_v4() primary key,
   clinic_id uuid references public.clinics(id) on delete cascade not null,
   patient_id uuid references public.patients(id) on delete cascade not null,
   status text check (status in ('pending', 'triaged', 'reviewed', 'archived')) default 'pending',
   answers_json jsonb not null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create Triage Outputs Table
create table if not exists public.triage_outputs (
   id uuid default uuid_generate_v4() primary key,
   clinic_id uuid references public.clinics(id) on delete cascade not null,
   intake_id uuid references public.intakes(id) on delete cascade not null,
   summary_json jsonb not null,
   risk_flags_json jsonb,
   urgency_tier text check (urgency_tier in ('Critical', 'High', 'Moderate', 'Low')) not null,
   created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Clinician Interest Table
create table if not exists public.clinician_interest (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text,
  organisation text,
  email text not null,
  goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add patient_context to triage_sessions if not exists (using alter table for safety in existing DBs)
-- Note: In a fresh run, we can just add it to the create table definition above.
-- For this file which serves as a setup script, I'll add it to the create table block.
-- If you are running this on an existing DB, use:
-- alter table public.triage_sessions add column patient_context jsonb;

-- Add clinic_id to triage_sessions
alter table public.triage_sessions add column if not exists clinic_id uuid references public.clinics(id) on delete set null;

-- Add unique constraint on triage_sessions.session_id
alter table public.triage_sessions drop constraint if exists triage_sessions_session_id_unique;
alter table public.triage_sessions add constraint triage_sessions_session_id_unique unique (session_id);

-- Drop messages policies before altering schema to avoid type mismatch
drop policy if exists "Anyone can insert messages" on public.messages;
drop policy if exists "Users view own messages" on public.messages;

-- Update messages table: change session_id to text and reference triage_sessions.session_id
alter table public.messages drop constraint if exists messages_session_id_fkey;
alter table public.messages alter column session_id type text;
alter table public.messages add constraint messages_session_id_fkey foreign key (session_id) references public.triage_sessions(session_id) on delete cascade;

-- Recreate messages policies after altering schema
create policy "Anyone can insert messages" on public.messages
  for insert with check (true);

create policy "Users view own messages" on public.messages
  for select using (
    exists (
      select 1 from public.triage_sessions
      where triage_sessions.session_id = messages.session_id
      and (
        triage_sessions.user_id::text = auth.uid()::uuid -- Owner
        or
        (triage_sessions.user_id is null) -- Anon session (demo mode)
      )
    )
  );

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS
alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;
alter table public.triage_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.clinics enable row level security;
alter table public.clinic_memberships enable row level security;
alter table public.patient_links enable row level security;
alter table public.patients enable row level security;
alter table public.intakes enable row level security;
alter table public.triage_outputs enable row level security;

-- Waitlist: Allow anyone to insert (public form), only admins can view
drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

drop policy if exists "Only admins can view waitlist" on public.waitlist;
create policy "Only admins can view waitlist" on public.waitlist
  for select using (auth.role() = 'service_role');

-- Profiles: Users can view/edit their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid()::uuid = id::text);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid()::uuid = id::text);

-- Triage Sessions: Anon users can insert, Users can view their own
drop policy if exists "Anyone can create triage session" on public.triage_sessions;
create policy "Anyone can create triage session" on public.triage_sessions
  for insert with check (true);

drop policy if exists "Users view own sessions" on public.triage_sessions;
create policy "Users view own sessions" on public.triage_sessions
  for select using (
    auth.uid()::uuid = user_id::text -- Authenticated users
    or
    (user_id is null) -- Allow anon access (simplified for demo, refine for prod)
  );

-- Messages: Same as sessions
drop policy if exists "Anyone can insert messages" on public.messages;
create policy "Anyone can insert messages" on public.messages
  for insert with check (true);

drop policy if exists "Users view own messages" on public.messages;
create policy "Users view own messages" on public.messages
  for select using (
    exists (
      select 1 from public.triage_sessions
      where triage_sessions.session_id = messages.session_id
      and (
        triage_sessions.user_id::text = auth.uid()::uuid -- Owner
        or
        (triage_sessions.user_id is null) -- Anon session (demo mode)
      )
    )
  );

-- Clinician Interest: Anyone can insert, only admins can view
drop policy if exists "Anyone can submit interest" on public.clinician_interest;
create policy "Anyone can submit interest" on public.clinician_interest
  for insert with check (true);

drop policy if exists "Only admins can view interest" on public.clinician_interest;
create policy "Only admins can view interest" on public.clinician_interest
    for select using (auth.role() = 'service_role');

-- Clinics: Users can view clinics they belong to, create new ones
drop policy if exists "Users can view their clinics" on public.clinics;
create policy "Users can view their clinics" on public.clinics
    for select using (
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = clinics.id and user_id::text = auth.uid()::uuid
      )
    );

drop policy if exists "Users can create clinics" on public.clinics;
create policy "Users can create clinics" on public.clinics
    for insert with check (true);

-- Clinic Memberships: Users can view their own memberships
drop policy if exists "Users can view own memberships" on public.clinic_memberships;
create policy "Users can view own memberships" on public.clinic_memberships
    for select using (user_id::text = auth.uid()::uuid);

drop policy if exists "Clinic owners can manage memberships" on public.clinic_memberships;
create policy "Clinic owners can manage memberships" on public.clinic_memberships
    for all using (
      exists (
        select 1 from public.clinic_memberships cm
        where cm.clinic_id = clinic_memberships.clinic_id
        and cm.user_id::text = auth.uid()::uuid and cm.role = 'OWNER'
      )
    );

-- Patient Links: Clinic members can manage, public can read valid links
drop policy if exists "Clinic members can manage links" on public.patient_links;
create policy "Clinic members can manage links" on public.patient_links
    for all using (
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = patient_links.clinic_id and user_id::text = auth.uid()::uuid
      )
    );

drop policy if exists "Public can read valid links" on public.patient_links;
create policy "Public can read valid links" on public.patient_links
    for select using (expires_at is null or expires_at > now());

-- Patients: Clinic members can access
drop policy if exists "Clinic members can access patients" on public.patients;
create policy "Clinic members can access patients" on public.patients
    for all using (
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = patients.clinic_id and user_id::text = auth.uid()::uuid
      )
    );

-- Intakes: Clinic members can access
drop policy if exists "Clinic members can access intakes" on public.intakes;
create policy "Clinic members can access intakes" on public.intakes
    for all using (
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = intakes.clinic_id and user_id::text = auth.uid()::uuid
      )
    );

-- Triage Outputs: Clinic members can access
drop policy if exists "Clinic members can access triage outputs" on public.triage_outputs;
create policy "Clinic members can access triage outputs" on public.triage_outputs
    for all using (
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = triage_outputs.clinic_id and user_id::text = auth.uid()::uuid
      )
    );

-- Update Triage Sessions policy to include clinic check
drop policy if exists "Clinic members can access triage sessions" on public.triage_sessions;
create policy "Clinic members can access triage sessions" on public.triage_sessions
    for all using (
      clinic_id is null or
      exists (
        select 1 from public.clinic_memberships
        where clinic_id = triage_sessions.clinic_id and user_id::text = auth.uid()::uuid
      )
    );

-- Update Messages policy to include clinic check
drop policy if exists "Clinic members can access messages" on public.messages;
create policy "Clinic members can access messages" on public.messages
    for all using (
      exists (
        select 1 from public.triage_sessions ts
        left join public.clinic_memberships cm on cm.clinic_id = ts.clinic_id
        where ts.session_id = messages.session_id
        and (ts.clinic_id is null or (cm.user_id::text = auth.uid()::uuid))
      )
    );

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
