/**
 * Chapter 5 — Hardening: Noise Filter
 * Five-gate filter preventing false positives.
 * Protects engineer trust — the most fragile asset in any automated system.
 * Author: Abhay Kumar Chaudhary
 */
class NoiseFilter {
  constructor() {
    this.recentRecommendations = new Map();
    this.noisePatterns         = new Set();
  }

  passesAnomalyThreshold(cluster)  { return cluster.anomalyScore >= 0.4; }
  isKnownNoise(cluster)            { return this.noisePatterns.has(`${cluster.service}:${cluster.errorSignals[0]?.type}`); }
  meetsConfidenceFloor(llmResult)  { return llmResult.confidence >= 0.4; }

  isSustained(cluster, previousClusters) {
    return previousClusters.some(c =>
      c.service === cluster.service &&
      Date.now() - new Date(c.timespan.last).getTime() < 120000
    );
  }

  isDuplicate(cluster) {
    const key     = `${cluster.service}:${cluster.errorSignals[0]?.type}`;
    const lastSent = this.recentRecommendations.get(key);
    if (lastSent && Date.now() - lastSent < 900000) return true;
    this.recentRecommendations.set(key, Date.now());
    return false;
  }

  markAsNoise(service, errorType, reason) {
    const key = `${service}:${errorType}`;
    this.noisePatterns.add(key);
    console.log(`[NoiseFilter] Learned noise pattern: ${key} — ${reason}`);
  }

  shouldFire(cluster, llmResult, previousClusters) {
    return (
      this.passesAnomalyThreshold(cluster) &&
      this.isSustained(cluster, previousClusters) &&
      !this.isKnownNoise(cluster) &&
      !this.isDuplicate(cluster) &&
      this.meetsConfidenceFloor(llmResult)
    );
  }
}

module.exports = NoiseFilter;
