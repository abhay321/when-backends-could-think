/**
 * Chapter 3 — Reasoning Layer: Signal Correlator
 * Groups signals arriving within the same time window into clusters.
 * Applies causal ordering and anomaly scoring.
 * Author: Abhay Kumar Chaudhary
 */
class SignalCorrelator {
  constructor(windowSeconds = 300) {
    this.windowSeconds = windowSeconds;
    this.signalBuffer  = new Map();
  }

  ingest(event) {
    const key = event.source;
    if (!this.signalBuffer.has(key)) this.signalBuffer.set(key, []);
    this.signalBuffer.get(key).push({ ...event, ingestedAt: Date.now() });

    const cutoff = Date.now() - (this.windowSeconds * 1000);
    this.signalBuffer.set(key, this.signalBuffer.get(key).filter(s => s.ingestedAt > cutoff));

    return this.buildCluster(key);
  }

  buildCluster(service) {
    const signals = this.signalBuffer.get(service) || [];
    if (signals.length === 0) return null;

    const sorted         = [...signals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const deploySignal   = sorted.find(s => s.type === "deployment.completed");
    const errorSignals   = sorted.filter(s => s.type.startsWith("error.") || s.type.startsWith("latency."));
    const businessSignals= sorted.filter(s => s.type.startsWith("business."));
    const anomalyScore   = this.scoreAnomaly(errorSignals);

    return {
      service, windowSeconds: this.windowSeconds, signalCount: signals.length,
      anomalyScore, severity: this.deriveSeverity(anomalyScore),
      causalCandidate: deploySignal || null,
      errorSignals, businessSignals,
      timespan: { first: sorted[0].timestamp, last: sorted[sorted.length - 1].timestamp }
    };
  }

  scoreAnomaly(errorSignals) {
    if (errorSignals.length === 0) return 0;
    const scores = errorSignals.map(s => Math.min((s.payload.deltaPercent || 0) / 2000, 1.0));
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  deriveSeverity(score) {
    if (score >= 0.8) return "P1";
    if (score >= 0.5) return "P2";
    if (score >= 0.2) return "P3";
    return "INFO";
  }
}

module.exports = SignalCorrelator;
