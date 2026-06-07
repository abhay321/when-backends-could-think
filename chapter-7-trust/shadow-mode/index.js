/**
 * Chapter 7 — Trust: Shadow Mode Runner
 * Phase 1 of trust building. System runs silently — no notifications.
 * Generates shadow log to prove accuracy before asking engineers to trust it.
 * Author: Abhay Kumar Chaudhary
 */
class ShadowModeRunner {
  constructor() {
    this.shadowLog    = [];
    this.startTime    = Date.now();
    this.totalRuns    = 0;
    this.correctCalls = 0;
  }

  async runShadow(cluster, recommendation) {
    this.totalRuns++;
    const entry = {
      id:        `shadow_${Date.now()}`,
      timestamp: new Date().toISOString(),
      service:   cluster.service,
      severity:  cluster.severity,
      predicted: {
        rootCause:         recommendation.diagnosis.rootCause,
        confidence:        recommendation.diagnosis.confidence,
        recommendedAction: recommendation.action.recommended
      },
      actual:    null,
      wasCorrect: null
    };
    this.shadowLog.push(entry);
    return entry.id;
  }

  async evaluatePrediction(shadowId, actualResolution, actualRootCause) {
    const entry       = this.shadowLog.find(e => e.id === shadowId);
    const actionMatch = entry.predicted.recommendedAction === actualResolution;
    const rcMatch     = this.rootCausesAlign(entry.predicted.rootCause, actualRootCause);
    const score       = (actionMatch ? 1 : 0) + (rcMatch ? 0.5 : 0);
    entry.actual      = { resolution: actualResolution, rootCause: actualRootCause };
    entry.wasCorrect  = score >= 1;
    if (score >= 1) this.correctCalls++;
    return score;
  }

  generateReport() {
    const accuracy     = this.totalRuns > 0 ? this.correctCalls / this.totalRuns : 0;
    const daysRunning  = (Date.now() - this.startTime) / 86400000;
    const ready        = this.totalRuns >= 20 && accuracy >= 0.75 && daysRunning >= 7;
    return {
      daysRunning:     daysRunning.toFixed(1),
      totalIncidents:  this.totalRuns,
      accuracy:        `${(accuracy * 100).toFixed(1)}%`,
      readyForPhase2:  ready,
      recommendation:  ready
        ? "System meets Phase 2 criteria — enable advisor mode"
        : `Not ready — need ${Math.max(0, 20 - this.totalRuns)} more incidents`
    };
  }

  rootCausesAlign(predicted, actual) {
    const cat = text => {
      const t = text.toLowerCase();
      if (["deploy","version","release","rollback"].some(k => t.includes(k))) return "deploy";
      if (["database","query","index","connection"].some(k => t.includes(k))) return "database";
      if (["dependency","timeout","upstream","gateway"].some(k => t.includes(k))) return "dependency";
      return "unknown";
    };
    return cat(predicted) === cat(actual);
  }
}

module.exports = ShadowModeRunner;
