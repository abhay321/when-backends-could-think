# Case Study 1 — CompanyXXX: PostgreSQL Migration

> Company name anonymised. This case study is based on a real production engagement.

## Scenario
Payment + KYC microservice migration from SQL Server to Amazon RDS PostgreSQL.
Cost reduction target: 40%. Risk: live payment system handling real financial transactions.

## What went wrong
Missing indexes on PostgreSQL after cutover caused sequential scans.
KYC query latency: 45ms → 1,840ms (P99).
KYC failure rate: 0% → 23%.

## What the Thinking Backend caught
- T+3 min: db.query.slow signal on kyc_checks table
- T+3 min: migration.performance.delta > 200% correlated with cutover event
- T+4 min: recommendation generated

## Recommendation output
```json
{
  "rootCause": "PostgreSQL query plan regression on kyc_checks — missing index causing sequential scan",
  "confidence": 0.84,
  "recommendedAction": "config-fix",
  "recommendedActionDetail": "CREATE INDEX CONCURRENTLY idx_kyc_checks_status_created ON kyc_checks(status, created_at)",
  "urgency": "immediate",
  "caveat": "Use CONCURRENTLY to avoid table lock — build takes 2-3 minutes"
}
```

## Impact
| Metric | Without System | With System |
|--------|---------------|-------------|
| MTTR | 60 minutes | 9 minutes |
| Users affected | ~3,800 | ~380 |
| Detection time | T+14 min | T+3 min |
