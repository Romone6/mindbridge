# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Database Migration**: Updated `003_multitenant_schema.sql` to fully reset tables and fix `auth.uid()` vs Clerk ID type mismatch.
  - Replaced `auth.uid()::text` with `auth_user_id()` helper which safely extracts `sub` claim.
  - Added `DROP TABLE IF EXISTS` to ensure clean schema application.
  - Merged public intake policies into the main schema file.

### Added
- `docs/AUDIT.md`: Initial repository audit.
- `docs/PRODUCT_SPEC.md`: Product specification.
- `tracking/CHANGELOG.md`: Changelog tracking.
- `middleware.ts`: Clerk authentication middleware.
- `components/providers/clinic-provider.tsx`: Clinic context provider.
- `app/dashboard/layout.tsx`: Dashboard layout with Clinic Provider.
- `app/onboarding/page.tsx`: Clinic onboarding wizard.
- `app/dashboard/team/page.tsx`: Team management page (UI only).
- `app/intake/[clinicId]/page.tsx`: Public patient intake flow.
- `app/actions/intake.ts`: Server action for intake submission and mock triage.

### Changed
- Refactored `DashboardShell` to support multi-tenancy and removed it from page wrappers.
- Updated `lib/supabase.ts` to support Clerk token.
- Updated `middleware.ts` to allow public access to `/intake/*`.
