# Implementation Plan: MindBridge (AU Pilot) Foundation

## Status Update
I have completed the foundational setup, database schema, and core onboarding flow.

### ✅ Completed
1.  **Repo Audit & Docs**: Created `docs/AUDIT.md`, `docs/PRODUCT_SPEC.md`, `tracking/CHANGELOG.md`.
2.  **Auth Security**: Implemented `middleware.ts` to protect `/dashboard` and `/onboarding` routes using Clerk.
3.  **Database Schema**: Created `supabase/migrations/003_multitenant_schema.sql` defining:
    - `clinics` (Tenant)
    - `clinic_memberships` (RBAC)
    - `patients`, `intakes`, `triage_outputs` (Core Data)
    - Row Level Security (RLS) policies enforcing tenant isolation.
4.  **Clinic Context**: Implemented `ClinicProvider` and `useClinic` hook to manage active clinic state globally.
5.  **Dashboard Layout**: Refactored `DashboardShell` to support multi-tenancy and updated all dashboard pages (`/dashboard`, `/patients`, `/settings`, etc.) to use the new `DashboardLayout`.
6.  **Onboarding Wizard**: Built `/onboarding` flow for creating new clinics.
7.  **Team Management**: Created `/dashboard/team` page UI (ready for API integration).

## Next Steps (Phase 4 & 5)
1.  **Patient Intake**: Build the public intake form link.
2.  **Triage Pipeline**: Implement the server-side triage generation (LLM integration).
3.  **Team API**: Connect the Team page to real invite logic (Server Actions).
4.  **Billing**: Implement the billing module.

## Instructions for You
- **Database**: Run the SQL in `supabase/migrations/003_multitenant_schema.sql` in your Supabase SQL Editor.
- **Environment**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.
- **Testing**:
    1.  Sign in (Clerk).
    2.  You should be redirected to `/onboarding` (if no clinic exists).
    3.  Create a clinic.
    4.  Verify you land on `/dashboard` with the clinic name in the header.
