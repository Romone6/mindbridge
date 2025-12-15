-- -----------------------------------------------------------------------------
-- AUDIT SCHEDULE TABLE
-- Run this in the Supabase SQL Editor after SETUP_DB.sql
-- -----------------------------------------------------------------------------

-- Create Audit Schedule Table
create table public.audit_schedule (
  id uuid default uuid_generate_v4() primary key,
  audit_type text not null check (audit_type in ('internal', 'external', 'penetration_test', 'soc2', 'hipaa', 'gdpr', 'iso27001')),
  title text not null,
  description text,
  scheduled_date date not null,
  status text check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')) default 'scheduled',
  auditor_name text,
  auditor_org text,
  findings_summary text,
  completed_date date,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_schedule enable row level security;

-- Only authenticated users can view audits
create policy "Authenticated users can view audits" on public.audit_schedule
  for select using (auth.role() = 'authenticated');

-- Only admins/providers can create/update audits
create policy "Admin can manage audits" on public.audit_schedule
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'provider')
    )
  );

-- Index for faster queries
create index audit_schedule_date_idx on public.audit_schedule(scheduled_date);
create index audit_schedule_status_idx on public.audit_schedule(status);

-- Function to auto-update updated_at timestamp
create or replace function public.update_audit_schedule_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger audit_schedule_updated_at
  before update on public.audit_schedule
  for each row execute procedure public.update_audit_schedule_updated_at();

-- Insert some sample audit data
insert into public.audit_schedule (audit_type, title, description, scheduled_date, status, auditor_name, auditor_org) values
  ('internal', 'Q1 2026 Internal Security Review', 'Quarterly internal review of security controls and access policies.', '2026-01-15', 'scheduled', 'Security Team', 'MindBridge'),
  ('soc2', 'SOC 2 Type II Audit', 'Annual SOC 2 Type II audit for trust service criteria.', '2026-03-01', 'scheduled', 'External Auditor', 'Big Four Firm'),
  ('penetration_test', 'Annual Penetration Test', 'Third-party penetration testing of all production systems.', '2026-02-15', 'scheduled', 'Security Researcher', 'PenTest Co'),
  ('hipaa', 'HIPAA Compliance Review', 'Review of HIPAA administrative, physical, and technical safeguards.', '2026-04-01', 'scheduled', 'Compliance Officer', 'Healthcare Consultants');
