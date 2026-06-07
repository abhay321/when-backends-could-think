/**
 * Chapter 3 — Reasoning Layer: LLM Synthesizer
 * Uses Claude to synthesize signal clusters + memory context
 * into structured, actionable recommendations.
 * Author: Abhay Kumar Chaudhary
 */
const Anthropic = require("@anthropic-ai/sdk");
const client    = new Anthropic();

function buildPrompt(cluster, patternMatch) {
  return `
You are an expert backend systems reliability engineer.
Analyse the following incident and produce a structured diagnosis.

## CURRENT INCIDENT
Service: ${cluster.service}
Severity: ${cluster.severity}
Anomaly score: ${cluster.anomalyScore.toFixed(2)} / 1.0

Error signals:
${cluster.errorSignals.map(s =>
  `- ${s.type}: ${s.payload.errorRate}% on ${s.payload.endpoint} (delta: +${s.payload.deltaPercent}%)`
).join("\n")}

Causal candidate:
${cluster.causalCandidate
  ? `Deploy ${cluster.causalCandidate.enrichment.activeDeployment.version} — ${cluster.causalCandidate.enrichment.minutesSinceDeploy} min ago`
  : "No recent deployment"}

## HISTORICAL MATCHES
${patternMatch.hasHistory
  ? patternMatch.allMatches.map((m, i) =>
    `Match ${i+1} (${(m.similarity*100).toFixed(0)}% similar): ${m.incident_id} — resolved by ${m.resolution} in ${m.mttr_minutes} min`
  ).join("\n")
  : "No historical matches found."
}

## RESPONSE FORMAT
Respond ONLY with valid JSON — no preamble, no markdown:
{
  "rootCause": "one sentence",
  "confidence": 0.0,
  "confidenceReason": "why",
  "explanation": "2-3 sentences for on-call engineer",
  "recommendedAction": "rollback|investigate|scale|config-fix|monitor",
  "recommendedActionDetail": "specific steps",
  "alternativeAction": "fallback if primary fails",
  "urgency": "immediate|within-15-min|within-1-hour|low",
  "matchedIncident": "ID or null",
  "caveat": "what to check before acting"
}`;
}

async function synthesize(cluster, memoryContext, patternMatch) {
  const prompt   = buildPrompt(cluster, patternMatch);
  const response = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 1024,
    messages:   [{ role: "user", content: prompt }]
  });
  const raw   = response.content[0].text;
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    return {
      rootCause: "Unable to parse LLM response", confidence: 0,
      explanation: raw, recommendedAction: "investigate",
      urgency: "within-15-min", matchedIncident: null,
      caveat: "Manual analysis required"
    };
  }
}

module.exports = { synthesize };
