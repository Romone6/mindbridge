# Clinic Multi-Tenancy Architecture Plan

## Overview
This plan outlines the design for clinic-scoped data isolation in MindBridge, including database schema, RLS policies, UX flows, and required component changes.

## Database Schema

### New Tables

#### clinics
```sql
create table public.clinics (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### clinic_memberships
```sql
create table public.clinic_memberships (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('OWNER', 'CLINICIAN', 'STAFF', 'READ_ONLY')) default 'CLINICIAN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(clinic_id, user_id)
);
```

#### patient_links
```sql
create table public.patient_links (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  link_token text not null unique,
  expires_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### patients
```sql
create table public.patients (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_ref text not null, -- Anonymous identifier like "Patient-001"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(clinic_id, patient_ref)
);
```

#### intakes
```sql
create table public.intakes (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  status text check (status in ('pending', 'triaged', 'reviewed', 'archived')) default 'pending',
  answers_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### triage_outputs
```sql
create table public.triage_outputs (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  intake_id uuid references public.intakes(id) on delete cascade not null,
  summary_json jsonb not null,
  risk_flags_json jsonb,
  urgency_tier text check (urgency_tier in ('Critical', 'High', 'Moderate', 'Low')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Modified Tables

#### triage_sessions
Add clinic_id:
```sql
alter table public.triage_sessions add column clinic_id uuid references public.clinics(id) on delete set null;
```

#### messages
No changes needed, but ensure RLS scopes via session.

## RLS Policies

### Helper Function
```sql
create or replace function public.is_clinic_member(clinic_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.clinic_memberships
    where clinic_id = clinic_uuid and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;
```

### Clinics
- Enable RLS
- Policy: Users can view clinics they are members of
- Policy: Users can create clinics (for onboarding)

### Clinic Memberships
- Enable RLS
- Policy: Users can view their own memberships
- Policy: Clinic owners can manage memberships

### Patient Links
- Enable RLS
- Policy: Clinic members can CRUD links for their clinics
- Policy: Public can read valid, non-expired links (for patient access)

### Patients, Intakes, Triage Outputs
- Enable RLS
- Policy: Clinic members can access data for their clinics

### Triage Sessions & Messages
- Update existing policies to check clinic membership via clinic_id

## UX Flows

### Clinic Dashboard
1. Provider logs in, selects clinic
2. Overview: Analytics (patient count, risk distribution), recent activity
3. Patient Queue: Filtered list with risk badges, search/filter
4. Actions: Generate patient link, view settings

### Patient Link Creation
1. In dashboard, "Generate Link" button
2. Form: Expiration time (default 24h), optional notes
3. Creates patient_links entry, displays shareable URL
4. URL format: `/intake/{clinicId}?token={token}`

### Patient Triage
1. Patient receives link, accesses intake page
2. Validates token (check exists and not expired)
3. Fills intake form, submits
4. System creates patient, intake, starts triage session
5. Chat triage: AI assesses, stores messages
6. Completion: Generates triage output, flags for review

### Clinic Review
1. Clinician clicks "Review Case" from queue
2. View: Patient ref, intake answers, triage summary, chat transcript
3. Actions: Add clinician notes, change status, escalate
4. Update intake status to 'reviewed'

## Component Changes

### Database
- Update `SETUP_DB.sql` with new tables and policies

### Providers
- `clinic-provider.tsx`: Ensure queries work with new schema

### Dashboard
- `dashboard/page.tsx`: Add link generation component
- `patients/page.tsx`: Update queries for clinic scoping
- `patients/[id]/page.tsx`: Add review interface

### Intake
- `intake/[clinicId]/page.tsx`: Add token validation
- `actions/intake.ts`: Update to create patient/intake with clinic_id

### API
- `api/triage/route.ts`: Add clinic_id to session creation

### New Components
- Patient link generator component
- Token validation middleware
- Review case interface

## Implementation Order
1. Database schema updates
2. RLS policies
3. Backend API updates
4. Component updates
5. New feature components
6. Testing and validation