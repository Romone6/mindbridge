# Release Notes

## [Unreleased]
### Added
- SOC 2 Compliance Framework
- Audit Logging (`lib/logging/audit-logger.ts`)
- Structured JSON Logger (`lib/logger.ts`)
- Health Check Endpoint (`/api/health`)
- Rate Limiting (`lib/security/rate-limit.ts`)
- Secure Env Validation (`lib/env.ts`)

### Changed
- Hardened `next.config.ts` with CSP headers
- Enhanced `SETUP_DB.sql` with audit_logs schema

### Security
- Added Gitleaks secret scanning
- Added Trivy dependency scanning
