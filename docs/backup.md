# Backup & Disaster Recovery Runbook

## 1. Database Backups (Supabase)

Supabase provides automated daily backups. For SOC 2 compliance, we also perform manual point-in-time recovery testing.

### Automated Backups
- **Frequency**: Daily (Full), WAL (Continuous)
- **Retention**: 7 days (Point-in-Time Recovery enabled)
- **Location**: AWS us-east-1 (Supabase managed)

### Manual Backup Script (On-Demand)
Run this script before major deployments:
```bash
# Requires Supabase CLI
supabase db dump --db-url "$SUPABASE_DB_URL" -f backup_$(date +%Y%m%d).sql
```

## 2. Restore Drill Checklist (Quarterly)

**Objective**: Verify RTO (Recovery Time Objective) < 4 hours.

1. [ ] Create a fresh "Drill" project in Supabase
2. [ ] Identify last valid backup timestamp
3. [ ] Restore backup to Drill project:
   ```bash
   psql -d "$DRILL_DB_URL" -f backup_20250101.sql
   ```
4. [ ] Verify Data Integrity:
   - [ ] Check row counts for `users`, `audit_logs`
   - [ ] Check latest `audit_logs` entry timestamp
5. [ ] Connect application (local dev) to Drill project
6. [ ] Verify critical flows (Login, View Patient)
7. [ ] Document findings and actual RTO in `drills/` folder
8. [ ] Delete Drill project

## 3. Incident Response

If data corruption is detected:
1. Stop all write access (Scale down API or Enable Maintenance Mode)
2. Identify infection point (Audit Logs)
3. Initiate Point-in-Time Recovery (PITR) to T-5 minutes before infection
4. Verify integrity
5. Resume traffic
