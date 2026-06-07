# Case Study 2 — CompanyYYY: Elasticsearch Degradation

> Company name anonymised. This case study is based on a real production engagement.

## Scenario
Loyalty program platform with Elasticsearch powering real-time merchant dashboards.
Platform boosted user engagement by 25% — fragile if reporting quality drops.

## What went wrong
Unbounded terms aggregation on user_id field caused JVM heap pressure.
Heap: 65% → 83% with 12% GC overhead. Shard failure imminent.

## What the Thinking Backend caught
- T+0: es.jvm.heap_pressure rising on es-node-02
- T+2 min: fielddata eviction rate +400%
- T+4 min: recommendation generated before any merchant noticed

## Recommendation output
```json
{
  "rootCause": "Unbounded terms aggregation on user_id causing excessive fielddata pressure",
  "confidence": 0.81,
  "recommendedAction": "config-fix",
  "recommendedActionDetail": "Add size limit: { terms: { field: 'user_id', size: 1000 } } + enable eager_global_ordinals",
  "urgency": "within-15-min",
  "impact": { "usersAffected": 0, "slaBreachEta": 18 }
}
```

## Impact
Users affected: **zero** — caught before any merchant noticed.
MTTR: 11 minutes.
