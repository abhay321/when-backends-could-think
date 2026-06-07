/**
 * Chapter 1 — Event Layer: Normaliser
 * Converts all incoming signals into the universal event schema.
 * Author: Abhay Kumar Chaudhary
 */
const { v4: uuidv4 } = require("uuid");

function normalise(rawSignal, source) {
  return {
    eventId:     `evt_${uuidv4().replace(/-/g,"").substring(0,20)}`,
    timestamp:   new Date().toISOString(),
    source:      source || rawSignal.source || "unknown",
    type:        classifySignal(rawSignal),
    severity:    deriveSeverity(rawSignal),
    environment: rawSignal.environment || process.env.ENVIRONMENT || "production",
    region:      rawSignal.region      || process.env.AWS_REGION  || "ap-south-1",
    payload:     extractPayload(rawSignal),
    traceId:     rawSignal.traceId     || null,
    enrichment:  null
  };
}

function classifySignal(raw) {
  if (raw.errorRate !== undefined)      return "error.rate.spike";
  if (raw.latencyP99 !== undefined)     return "latency.p99.spike";
  if (raw.deployVersion !== undefined)  return "deployment.completed";
  if (raw.dlqDepth !== undefined)       return "queue.dlq.depth";
  if (raw.conversionRate !== undefined) return "business.conversion.drop";
  if (raw.heapPercent !== undefined)    return "es.jvm.heap_pressure";
  if (raw.indexLag !== undefined)       return "es.index.lag";
  return "signal.unknown";
}

function deriveSeverity(raw) {
  const errorRate    = raw.errorRate    || 0;
  const deltaPercent = raw.deltaPercent || 0;
  if (errorRate > 5   || deltaPercent > 1000) return "P1";
  if (errorRate > 2   || deltaPercent > 500)  return "P2";
  if (errorRate > 0.5 || deltaPercent > 100)  return "P3";
  return "INFO";
}

function extractPayload(raw) {
  return {
    errorRate:     raw.errorRate     || null,
    baseline:      raw.baseline      || null,
    deltaPercent:  raw.deltaPercent  || null,
    endpoint:      raw.endpoint      || null,
    httpStatus:    raw.httpStatus    || null,
    latencyP99:    raw.latencyP99    || null,
    dlqDepth:      raw.dlqDepth      || null,
    heapPercent:   raw.heapPercent   || null,
    windowSeconds: raw.windowSeconds || 60,
  };
}

module.exports = { normalise };
