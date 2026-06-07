<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=When%20Backends%20Could%20Think&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=38&desc=Building%20Cognitive%20Backend%20Systems&descAlignY=60&descSize=18" width="100%"/>

<br/>

[![Author](https://img.shields.io/badge/Author-Abhay%20Kumar%20Chaudhary-378ADD?style=for-the-badge&logo=person&logoColor=white)](https://github.com/abhay321)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB%20%7C%20EventBridge-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/License-MIT-1D9E75?style=for-the-badge)](LICENSE)
[![Medium](https://img.shields.io/badge/Medium-Follow-000000?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@abhaykumarchaudhary3)

<br/>

> *"The goal is not automation. The goal is to make your best engineers available to every incident — even the ones that happen when they are asleep."*

<br/>

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACTIVE  →  COGNITIVE                       │
│                                                                 │
│  Before:  Alert fires → Engineer wakes up → 20 min of manual   │
│           log hunting → Root cause found → MTTR: 25 minutes    │
│                                                                 │
│  After:   Signal detected → Memory searched → LLM reasons →    │
│           Recommendation sent → Engineer approves → 6 minutes  │
└─────────────────────────────────────────────────────────────────┘
```

</div>

---

## 📖 What Is This?

This repository contains the **complete, production-ready code** for *"When Backends Could Think"* — a technical book about building systems that move from reactive alerting to intelligent, memory-driven incident response.

Built with **Node.js 18+**, **AWS Lambda**, **DynamoDB**, **pgvector**, **OpenSearch**, and **Claude (Anthropic API)**.

> ⚠️ **Note on company names:** All former employer and client names have been anonymised as `CompanyXXX` and `CompanyYYY` throughout this repository and book to protect their identities. Technical details and outcomes described are accurate.

---

## 🏗️ The 4-Layer Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                        EVENT LAYER                              ║
║  HTTP errors · Latency P99 · Deployments · Queue depth · KPIs  ║
║  Collect → Normalise → Enrich → Route to unified stream         ║
║  Tools: AWS EventBridge · Kinesis · Solace PUB/SUB · Lambda     ║
╠══════════════════════════════════════════════════════════════════╣
║                       MEMORY LAYER                              ║
║  Every incident · Every deployment · Every resolution stored    ║
║  Structured lookup + Semantic similarity search                 ║
║  Tools: DynamoDB · pgvector · OpenSearch · S3                   ║
╠══════════════════════════════════════════════════════════════════╣
║                     REASONING LAYER                             ║
║  Correlate signals → Match history → LLM synthesises           ║
║  → Business impact evaluated → Recommendation produced          ║
║  Tools: Signal Correlator · Pattern Matcher · Claude API        ║
╠══════════════════════════════════════════════════════════════════╣
║                      ACTION LAYER                               ║
║  Notify (Slack/PagerDuty) → Human gate → Step Functions         ║
║  Execute safely → Record outcome → Feed back to memory          ║
║  Tools: Slack · PagerDuty · Step Functions · EventBridge        ║
╚══════════════════════════════════════════════════════════════════╝
                              ↑
                    Learning Feedback Loop
              (Every resolution teaches the system)
```

---

## ⚡ The Core Difference — Same Incident, Different System

| Metric | Reactive System | Thinking Backend |
|--------|:--------------:|:----------------:|
| 🔍 Detection | T+8 minutes | **T+3 minutes** |
| 🧠 Root cause | T+20 min (manual) | **In recommendation** |
| ✅ Resolution | T+25 minutes | **T+6 minutes** |
| ⏱️ MTTR | **25 minutes** | **6 minutes** |
| 👥 Users affected | ~4,200 | **~680** |
| 💰 Revenue at risk | Unquantified | **Shown in real-time** |
| 😴 2am engineer | Manually hunting logs | **Reading a recommendation** |

---

## 📚 Book Structure & Code Map

<details>
<summary><b>📘 Chapter 1 — The Event Layer</b> · Collect · Normalise · Enrich · Route</summary>

### What It Does
Every backend generates constant data — logs, metrics, traces, deployment events. The problem is not a lack of data. The problem is silos, different formats, no shared language.

The Event Layer collects every signal, normalises it into **one universal schema**, enriches it with deployment context, and routes it by priority into a unified stream.

### Key Insight
```js
// Every signal becomes this shape — no exceptions
{
  eventId:     "evt_01HX9K2M3N4P5Q6R7S8T",
  timestamp:   "2024-11-14T02:34:11.842Z",
  source:      "checkout-service",
  type:        "error.rate.spike",
  severity:    "P1",
  payload: {
    errorRate:     4.2,
    baseline:      0.3,
    deltaPercent:  1300,
    endpoint:      "/api/checkout"
  },
  enrichment: {
    activeDeployment: { version: "v2.3.1", deployedAt: "...", deployedBy: "..." },
    minutesSinceDeploy: 8   // ← this single field drives correlation
  }
}
```

### Code
| File | Purpose |
|------|---------|
| [`chapter-1-event-layer/normaliser/index.js`](chapter-1-event-layer/normaliser/index.js) | Maps all signals to universal schema |
| [`chapter-1-event-layer/enricher/index.js`](chapter-1-event-layer/enricher/index.js) | Adds deployment context + SLA tier |
| [`chapter-1-event-layer/collectors/elasticsearchCollector.js`](chapter-1-event-layer/collectors/elasticsearchCollector.js) | ES-specific signal collection |
| [`chapter-1-event-layer/router/`](chapter-1-event-layer/router/) | P1 fast-lane vs standard routing |

### Tools Decision Matrix
| Tool | Best For | Avoid If |
|------|----------|----------|
| AWS EventBridge | Already on AWS, rule-based routing | Need replay > 24h |
| Apache Kafka | High volume, ordering guarantees | Simple AWS-only stack |
| Solace PUB/SUB | Enterprise, hierarchical topics | Starting fresh on AWS |
| AWS Kinesis | Lambda triggers, tight AWS ecosystem | Need >7-day replay |

</details>

<details>
<summary><b>📗 Chapter 2 — The Memory Layer</b> · Store · Index · Retrieve · Learn</summary>

### What It Does
A system that cannot remember is condemned to be surprised by the same incident forever.

Two kinds of memory are required:
- **Structured** (DynamoDB) — fast lookups: *"all P1 incidents for checkout-service, last 30 days"*
- **Semantic** (pgvector) — similarity search: *"find past incidents that feel like this one"*

### The Vector Search Advantage
```
Keyword search fails:
  INC-2847: "503 on checkout after deploy"
  INC-3021: "gateway timeout on payment after release"
  → Zero shared keywords → NO MATCH ❌

Vector search works:
  Both encoded as 1536-dim embeddings
  Cosine similarity = 0.94
  → MATCH FOUND: same pattern, different words ✅
```

### Schema Design
```
Table: incidents
  PK: SERVICE#checkout-service
  SK: INCIDENT#2024-11-14T02:34Z#INC001
  Attrs: severity, errorRate, deployVersion, minutesSinceDeploy,
         resolution, mttrMinutes, embeddingId

Table: deployments
  PK: SERVICE#checkout-service
  SK: DEPLOY#2024-11-14T02:26Z
  Attrs: version, author, commitSha, rolledBack

Table: learnings (pattern intelligence)
  PK: PATTERN#deploy_regression
  Attrs: occurrences, avgMTTR, bestAction, successRate
```

### Code
| File | Purpose |
|------|---------|
| [`chapter-2-memory-layer/dynamodb/index.js`](chapter-2-memory-layer/dynamodb/index.js) | Structured memory: 3-table schema |
| [`chapter-2-memory-layer/vector-store/index.js`](chapter-2-memory-layer/vector-store/index.js) | Bedrock embeddings + pgvector search |
| [`chapter-2-memory-layer/opensearch/index.js`](chapter-2-memory-layer/opensearch/index.js) | Trend aggregations + keyword queries |
| [`chapter-2-memory-layer/memory-writer/index.js`](chapter-2-memory-layer/memory-writer/index.js) | Parallel write to all 3 stores |
| [`chapter-2-memory-layer/memory-reader/index.js`](chapter-2-memory-layer/memory-reader/index.js) | Single recall interface for Reasoning Layer |

</details>

<details>
<summary><b>📙 Chapter 3 — The Reasoning Layer</b> · Correlate · Match · Synthesise · Evaluate</summary>

### What It Does
The Event Layer collects. The Memory Layer remembers. The Reasoning Layer **thinks**.

Four-step pipeline:

```
Step 1: SIGNAL CORRELATOR
  Groups signals in 5-min window
  Causal ordering (deploy before errors = candidate)
  Anomaly score 0.0→1.0

         ↓

Step 2: PATTERN MATCHER
  Vector similarity (weight: 60%)
  Recency decay over 180 days (weight: 20%)
  Resolution success rate (weight: 20%)
  → Composite confidence score

         ↓

Step 3: LLM SYNTHESIS
  Prompt = signals + top-K memory + runbook context
  Claude → structured JSON
  rootCause · confidence · explanation · action · caveat

         ↓

Step 4: BUSINESS IMPACT
  usersAffected = requests/sec × errorRate × window
  revenueAtRisk = revenuePerRequest × failedPerHour
  slaBreachEta  = (threshold - currentRate) / velocity
```

### Example Output
```json
{
  "rootCause": "Deploy v2.3.1 introduced breaking change in payment adapter",
  "confidence": 0.87,
  "explanation": "Error rate spiked 8 min after deploy v2.3.1. Matches INC-2847 (94% similar) — resolved by rollback in 4 min.",
  "recommendedAction": "rollback",
  "recommendedActionDetail": "Roll back to v2.3.0 via CodePipeline",
  "urgency": "immediate",
  "matchedIncident": "INC-2847",
  "caveat": "Verify no DB migration in progress before rollback",
  "impact": {
    "usersAffected": 1400,
    "revenueAtRisk": "₹2,30,400/hr",
    "slaBreachEta": 0,
    "cascadeRisk": "HIGH"
  }
}
```

### Code
| File | Purpose |
|------|---------|
| [`chapter-3-reasoning-layer/correlator/index.js`](chapter-3-reasoning-layer/correlator/index.js) | Signal clustering + anomaly scoring |
| [`chapter-3-reasoning-layer/pattern-matcher/index.js`](chapter-3-reasoning-layer/pattern-matcher/index.js) | Weighted similarity scoring |
| [`chapter-3-reasoning-layer/llm-synthesizer/index.js`](chapter-3-reasoning-layer/llm-synthesizer/index.js) | Claude prompt + structured JSON output |
| [`chapter-3-reasoning-layer/business-impact/index.js`](chapter-3-reasoning-layer/business-impact/index.js) | Users · Revenue · SLA calculations |

</details>

<details>
<summary><b>📕 Chapter 4 — The Action Layer</b> · Notify · Gate · Execute · Record</summary>

### The Golden Rule
> **Automate the communication. Assist the decision. Never automate the consequence without a human gate.**

### Action Taxonomy
| Action | Automated? | Why |
|--------|:----------:|-----|
| 📢 Slack + PagerDuty notify | ✅ Always | Zero production impact |
| 🎫 Create incident ticket | ✅ Yes | Fully reversible |
| 📈 Scale **up** | ✅ Phase 4 | Reversible |
| 🔄 Rollback deployment | ❌ **NEVER** | Highest impact — human always |
| 🗄️ Database operations | ❌ **NEVER** | Potentially irreversible |
| 🚩 Feature flag changes | ❌ **NEVER** | Can cascade to other systems |
| 🔐 IAM / security changes | ❌ **NEVER** | Security boundary — no exceptions |

> **Rule:** If the action cannot be undone in under 60 seconds — it needs a human. Confidence score is never high enough to override this.

### Step Functions Workflow
```
Approve clicked
      ↓
PreChecks Lambda
  ✅ No active DB migrations
  ✅ Pipeline not running
  ✅ Downstream services healthy
  ✅ No other active incidents
      ↓
ExecuteAction Lambda
      ↓
Wait 60 seconds (stabilisation)
      ↓
VerifyRecovery Lambda
  → Recovered? Notify success
  → Not recovered? Escalate
      ↓
RecordOutcome → Memory Layer update
```

### Code
| File | Purpose |
|------|---------|
| [`chapter-4-action-layer/notifier/index.js`](chapter-4-action-layer/notifier/index.js) | Slack blocks + PagerDuty |
| [`chapter-4-action-layer/human-gate/index.js`](chapter-4-action-layer/human-gate/index.js) | Approve/Reject webhook handler |
| [`chapter-4-action-layer/workflows/rollback.asl.json`](chapter-4-action-layer/workflows/) | Step Functions state machine |
| [`chapter-4-action-layer/outcome-recorder/index.js`](chapter-4-action-layer/outcome-recorder/) | Closes learning feedback loop |

</details>

<details>
<summary><b>🔧 Chapter 5 — Production Hardening</b> · Circuit Breakers · Degradation · Cost · Noise</summary>

### Five Hardening Concerns

#### 1. Circuit Breakers
Three states per dependency (LLM, vector store, DynamoDB, OpenSearch):
```
CLOSED → normal operation, requests flowing
  ↓ (5 failures in 60s)
OPEN → dependency failing, fallback activated
  ↓ (after 30s timeout)
HALF-OPEN → probe request sent
  ↓ success          ↓ failure
CLOSED             OPEN (reset timer)
```

#### 2. Three Degradation Modes
| Mode | Condition | Behaviour |
|------|-----------|-----------|
| **FULL** | All systems up | Complete 4-step reasoning |
| **PARTIAL** | LLM down | Rule-based only, confidence ≤ 70% |
| **MINIMAL** | Core down | Notify only, manual investigation |

*The system never fails silently — it always tells engineers what mode it's in.*

#### 3. LLM Cost Control
- **Deduplication:** Cache results 5 min per service+error-type fingerprint
- **Token budgets:** Trim prompts from 2000 → 400 tokens for standard incidents
- **Rate limits:** Max 3 LLM calls/min per service

#### 4. Five-Gate Noise Filter
1. Anomaly score ≥ 0.4
2. Sustained over 2 consecutive windows
3. Not a known noise pattern
4. Not a duplicate within 15 minutes
5. Confidence ≥ 0.4

#### 5. Self-Monitoring
Scheduled Lambda checks every minute: circuit breaker states, P99 latency, LLM error rate, false positive rate, average confidence.

### Code
| File | Purpose |
|------|---------|
| [`chapter-5-hardening/circuit-breaker/index.js`](chapter-5-hardening/circuit-breaker/index.js) | 3-state breaker per dependency |
| [`chapter-5-hardening/degradation/index.js`](chapter-5-hardening/degradation/) | Full / Partial / Minimal modes |
| [`chapter-5-hardening/cost-control/index.js`](chapter-5-hardening/cost-control/) | Dedup + token budget + rate limits |
| [`chapter-5-hardening/noise-filter/index.js`](chapter-5-hardening/noise-filter/index.js) | Five-gate false positive prevention |
| [`chapter-5-hardening/self-monitor/index.js`](chapter-5-hardening/self-monitor/) | System health dashboard Lambda |

</details>

<details>
<summary><b>📊 Chapter 6 — Real Case Studies</b> · CompanyXXX · CompanyYYY</summary>

> ⚠️ Company names anonymised. Technical details and outcomes are accurate.

### Case Study 1 — CompanyXXX: PostgreSQL Migration

**Scenario:** Payment + KYC microservice migrated from SQL Server to Amazon RDS PostgreSQL. 40% cost reduction target. High-risk on live payment system.

**What went wrong:** Missing indexes on PostgreSQL after cutover caused sequential scans. KYC query latency: 45ms → 1,840ms (P99). KYC failure rate climbed to 23%.

| Metric | Without System | With Thinking Backend |
|--------|:--------------:|:--------------------:|
| Detection | T+14 min | **T+3 min** |
| Root cause | T+45 min | **In recommendation** |
| Resolution | T+60 min | **T+9 min** |
| MTTR | **60 min** | **9 min** |
| KYC failures | ~3,800 | **~380** |

**Recommendation produced:**
```json
{
  "rootCause": "PostgreSQL query plan regression — missing index causing sequential scan on kyc_checks",
  "confidence": 0.84,
  "recommendedActionDetail": "CREATE INDEX CONCURRENTLY idx_kyc_checks_status_created ON kyc_checks(status, created_at)",
  "caveat": "Use CONCURRENTLY to avoid table lock — 2-3 min to build"
}
```

### Case Study 2 — CompanyYYY: Elasticsearch Degradation

**Scenario:** Loyalty platform with Elasticsearch powering real-time merchant dashboards. 25% engagement boost at stake.

**What was caught:** JVM heap pressure at 83% with 12% GC overhead — before any merchant noticed. Root cause: unbounded `terms` aggregation on `user_id` field creating excessive fielddata.

**Users affected: zero.** Caught before the problem surfaced. MTTR: 11 minutes.

| Metric | Without System | With Thinking Backend |
|--------|:--------------:|:--------------------:|
| Detection | Merchant complaint (2–4hr) | **T+4 min** |
| Users impacted | **All 847 merchants** | **Zero** |
| MTTR | 2–4 hours | **11 minutes** |

### Code
| File | Purpose |
|------|---------|
| [`chapter-6-case-studies/companyxxx/collectors.js`](chapter-6-case-studies/companyxxx/) | PostgreSQL query plan signal collector |
| [`chapter-6-case-studies/companyyy/collectors.js`](chapter-6-case-studies/companyyy/) | ES JVM + index lag signal collector |

</details>

<details>
<summary><b>🤝 Chapter 7 — Building Trust Over Time</b> · Shadow · Advisor · Gated · Trusted</summary>

### Why Trust Is The Hardest Problem
You can build all four layers perfectly and engineers will still ignore it. Trust is not granted — it is earned through demonstrated accuracy over time.

### Four Phases

```
PHASE 1: SHADOW MODE (Week 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
System runs silently. Recommendations generated but NOT sent.
Everything logged to shadow audit trail.
Compare predictions to actual resolutions.

Gate to Phase 2:
  ✅ 20+ incidents observed
  ✅ Accuracy ≥ 75%
  ✅ Running for 7+ days

PHASE 2: ADVISOR MODE (Month 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Notifications enabled — NO action buttons yet.
Engineers receive full recommendation as advisory.
Feedback: Correct / Partially correct / Wrong → teaches the system.

Gate to Phase 3:
  ✅ 50+ incidents
  ✅ Accuracy ≥ 85%
  ✅ False positive rate ≤ 10%

PHASE 3: GATED ACTIONS (Month 3-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Chapter 4 live. Approve / Reject buttons.
Step Functions workflows execute approved actions.
MTTR improvement becomes measurable.

Gate to Phase 4:
  ✅ 100+ incidents
  ✅ Accuracy ≥ 92%
  ✅ Zero false positives in last 30 days

PHASE 4: TRUSTED PARTNER (Month 6+)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Safe, reversible actions auto-fire (notify, scale-up, create ticket).
Rollback / DB ops / IAM always require human. This boundary never changes.
```

### The 90-Second Test
```
When an engineer gets a recommendation at 2am,
how long before they act on it?

< 90 seconds  → Immediate trust ✅
90s – 5 min   → Verified trust
5 – 15 min    → Cautious trust
> 15 min      → System hasn't earned it yet

Target: < 90s average by Month 3
```

### Trust Metrics Dashboard
| Metric | Target | Meaning |
|--------|--------|---------|
| Accuracy rate | ≥ 85% | Are recommendations correct? |
| False positive rate | ≤ 10% | Are engineers paged for nothing? |
| Avg approval time | < 90 seconds | Do engineers trust immediately? |
| MTTR improvement | ≥ 50% | Is the system actually helping? |
| Confidence calibration | 80% conf = 80% correct | Is system honest about uncertainty? |

### Code
| File | Purpose |
|------|---------|
| [`chapter-7-trust/shadow-mode/index.js`](chapter-7-trust/shadow-mode/index.js) | Silent validation runner |
| [`chapter-7-trust/advisor-mode/index.js`](chapter-7-trust/advisor-mode/) | Notify-only with feedback buttons |
| [`chapter-7-trust/metrics/index.js`](chapter-7-trust/metrics/) | Trust dashboard builder |
| [`chapter-7-trust/phase4/index.js`](chapter-7-trust/phase4/) | Trusted automation boundaries |

</details>

---

## 🚀 Quick Start

### Prerequisites
```bash
node --version    # >= 18.0.0
npm --version     # >= 8.0.0
aws --version     # >= 2.0.0 (configured with credentials)
```

### Installation
```bash
# 1. Clone
git clone https://github.com/abhay321/when-backends-could-think
cd when-backends-could-think

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your AWS credentials, API keys

# 4. Run tests
npm test

# 5. Deploy to AWS (requires CDK)
cd infrastructure && npm install && cdk deploy
```

### Environment Variables
```bash
# AWS
AWS_REGION=ap-south-1

# Anthropic — LLM Reasoning Layer
ANTHROPIC_API_KEY=sk-ant-your-key-here

# PostgreSQL + pgvector — Semantic Memory
PG_CONNECTION_STRING=postgresql://user:pass@host:5432/thinking_backend

# OpenSearch — Full-text Memory
OPENSEARCH_ENDPOINT=https://your-domain.ap-south-1.es.amazonaws.com

# Slack — Notifications + Human Gate
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_INCIDENTS_CHANNEL=#incidents

# PagerDuty — P1 escalation
PAGERDUTY_ROUTING_KEY=your-routing-key
```

---

## 🗂️ Repository Structure

```
when-backends-could-think/
│
├── 📁 chapter-1-event-layer/
│   ├── collectors/           # Signal collectors per source type
│   │   └── elasticsearchCollector.js
│   ├── normaliser/           # Universal event schema mapping
│   │   └── index.js
│   ├── enricher/             # Deployment context enrichment
│   │   └── index.js
│   └── router/               # EventBridge priority routing
│
├── 📁 chapter-2-memory-layer/
│   ├── dynamodb/             # Incidents + deployments + learnings tables
│   │   └── index.js
│   ├── vector-store/         # Bedrock embeddings + pgvector search
│   │   └── index.js
│   ├── opensearch/           # Full-text + aggregation queries
│   ├── memory-writer/        # Parallel write orchestrator Lambda
│   └── memory-reader/        # Single recall interface
│
├── 📁 chapter-3-reasoning-layer/
│   ├── correlator/           # Signal clustering (5-min window)
│   │   └── index.js
│   ├── pattern-matcher/      # Weighted similarity scoring
│   ├── llm-synthesizer/      # Claude prompt + JSON parsing
│   │   └── index.js
│   └── business-impact/      # Users · Revenue · SLA calculations
│
├── 📁 chapter-4-action-layer/
│   ├── notifier/             # Slack blocks + PagerDuty alerts
│   │   └── index.js
│   ├── human-gate/           # Approve/Reject webhook handler
│   ├── workflows/            # Step Functions ASL definitions
│   └── outcome-recorder/     # Resolution → memory feedback loop
│
├── 📁 chapter-5-hardening/
│   ├── circuit-breaker/      # 3-state breaker per dependency
│   │   └── index.js
│   ├── degradation/          # Full / Partial / Minimal modes
│   ├── cost-control/         # Dedup + token budget + rate limits
│   ├── noise-filter/         # 5-gate false positive prevention
│   │   └── index.js
│   └── self-monitor/         # Health dashboard Lambda
│
├── 📁 chapter-6-case-studies/
│   ├── companyxxx/           # PostgreSQL migration case study
│   └── companyyy/            # Elasticsearch degradation case study
│
├── 📁 chapter-7-trust/
│   ├── shadow-mode/          # Phase 1: silent validation
│   │   └── index.js
│   ├── advisor-mode/         # Phase 2: notify-only
│   ├── metrics/              # Trust dashboard + calibration
│   └── phase4/               # Trusted automation boundaries
│
├── 📁 infrastructure/        # AWS CDK stacks
├── 📁 tests/                 # Unit + integration tests
├── package.json
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ (Lambda) | All Lambda functions |
| Event streaming | AWS EventBridge + Kinesis | Signal routing |
| Structured memory | DynamoDB | Incident history, learnings |
| Semantic memory | pgvector (PostgreSQL) | Similarity search |
| Full-text search | AWS OpenSearch | Trend aggregations |
| Cold storage | S3 | Archives, runbooks |
| LLM reasoning | Claude (Anthropic) | Diagnosis synthesis |
| Embeddings | AWS Bedrock Titan | Vector generation |
| Workflows | AWS Step Functions | Safe action execution |
| Notifications | Slack + PagerDuty | Human-in-the-loop |
| Infrastructure | AWS CDK | Deployment |

---

## 📈 How Confidence Improves Over Time

```
Incidents  │  Avg Confidence  │  Note
───────────┼──────────────────┼──────────────────────────────
0          │  —               │  No history yet
10         │  65%             │  Some patterns emerging
25         │  72%             │  Common patterns well learned
50         │  80%             │  Strong historical base
100        │  86%             │  Deep institutional memory
200        │  91%             │  Expert-level pattern recognition
500        │  94%             │  Near-ceiling, human-level
```

Each resolved incident makes the next recommendation slightly more accurate. This is the compounding flywheel — the system earns trust not through claims, but through a demonstrable track record.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Test specific layer
npm test -- --testPathPattern=chapter-1
npm test -- --testPathPattern=chapter-3

# Integration tests (requires AWS credentials)
npm run test:integration

# Shadow mode validation (run for 7+ days before Phase 2)
node chapter-7-trust/shadow-mode/run.js --days=7
```

---

## 📝 Medium Articles

This book's chapters are also published as detailed Medium posts:

| Article | Status |
|---------|--------|
| [Building a High-Throughput API for Logging Millions of Events](https://medium.com/@abhaykumarchaudhary3) | ✅ Published |
| Chapter 1: The Event Layer — Collect, Normalise, Enrich, Route | 🔜 Coming soon |
| Chapter 2: The Memory Layer — Two Kinds of Memory | 🔜 Coming soon |
| Chapter 3: The Reasoning Layer — When Backends Think | 🔜 Coming soon |
| Chapter 4: The Action Layer — Humans in the Loop | 🔜 Coming soon |
| Chapter 5: Production Hardening — When the Watcher Breaks | 🔜 Coming soon |
| Chapter 6: Real Case Studies — From Theory to Production | 🔜 Coming soon |
| Chapter 7: Building Trust — The 90-Second Test | 🔜 Coming soon |

Follow on Medium: [@abhaykumarchaudhary3](https://medium.com/@abhaykumarchaudhary3)

---

## 👤 Author

<div align="center">

**Abhay Kumar Chaudhary**
Sr. Software Engineer — 8+ years building scalable backend systems

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ABHAY)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abhay321)
[![Medium](https://img.shields.io/badge/Medium-Read-000000?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@abhaykumarchaudhary3)

**Skills:** Node.js · Go · Python · AWS (Lambda, DynamoDB, EventBridge, Kinesis, ECS) · GraphQL · PostgreSQL · MongoDB · Redis · Elasticsearch · Docker · Microservices · Event-Driven Architecture

</div>

---

## 📄 License

MIT — use it, build on it, ship it. Attribution appreciated.

---

<div align="center">

*"This is not an AI that replaces engineers.*
*This is institutional memory with a reasoning engine attached.*
*Every incident your team resolves teaches the system something.*
*After 200 incidents, the system knows your architecture*
*the way a 10-year engineer does —*
*not from reading docs, but from being present for every failure,*
*every fix, every 2am page."*

<br/>

[![Star this repo](https://img.shields.io/github/stars/abhay321/when-backends-could-think?style=social)](https://github.com/abhay321/when-backends-could-think)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>
