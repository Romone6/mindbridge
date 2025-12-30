# MindBridge Product Specification (AU Pilot)

## Product Definition
MindBridge is a clinic intake + triage workflow system.
- **Patient**: Completes intake -> Structured summary + Risk Flags.
- **Clinician**: Reviews queue -> Actionable insights -> Export.
- **Admin**: Configures clinic settings -> Invites team.

## Core Entities (Supabase)
- **Clinics**: The tenant unit.
- **Clinic Memberships**: Users belonging to clinics (Owner, Clinician, Staff).
- **Patients**: Minimal PII.
- **Intakes**: The core unit of work (Patient submission).
- **Triage Outputs**: AI-generated analysis.
- **Audit Log**: Compliance tracking.

## Roles & Permissions
- **Owner**: Full access + Billing + Team Management.
- **Clinician**: View/Edit Patients & Intakes within their clinic.
- **Staff**: View only (optional).
- **Read Only**: Audit/Compliance view.

## Safety & Compliance (AU Context)
- **Emergency Redirect**: Immediate diversion for high-risk inputs.
- **Disclaimer**: "Not a diagnosis".
- **Data Residency**: Assume AU region (Supabase).
- **Encryption**: RLS + Encrypted columns for sensitive data.

## Engineering Phases
1.  **Foundations**: Auth, DB, Context.
2.  **Multi-tenancy**: Invites, Memberships.
3.  **Onboarding**: Clinic setup wizard.
4.  **Intake**: Patient flow + Triage.
5.  **Dashboard**: Queue + Case View.
6.  **Billing**: Pilot/Invoice flow.
