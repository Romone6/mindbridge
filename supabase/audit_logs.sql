-- -----------------------------------------------------------------------------
-- AUDIT LOGS TABLE (SOC 2 REQUIREMENT)
-- Run this in Supabase SQL Editor
-- -----------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id text, -- Can be UUID or string (auth provider ID)
  user_email text,
  user_role text,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  success boolean default true,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- IMMUTABILITY: No updates or deletes allowed for anyone
-- Only inserts are allowed by service roles and authenticated users (via API)
create policy "Enable insert for authenticated users" on public.audit_logs
  for insert with check (auth.role() = 'authenticated');

create policy "Enable insert for service role" on public.audit_logs
  for insert with check (true);

-- READ ACCESS: Only admins can read audit logs
create policy "Admins can view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Indexes for performance
create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_action_idx on public.audit_logs(action);
create index audit_logs_created_at_idx on public.audit_logs(created_at);
create index audit_logs_resource_type_idx on public.audit_logs(resource_type);
