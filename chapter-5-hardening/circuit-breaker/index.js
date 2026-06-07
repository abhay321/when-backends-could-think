/**
 * Chapter 5 — Hardening: Circuit Breaker
 * Three-state breaker (CLOSED/OPEN/HALF-OPEN) protecting
 * all critical dependencies: LLM, vector store, DynamoDB, OpenSearch.
 * Author: Abhay Kumar Chaudhary
 */
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name             = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout          = options.timeout          || 30000;
    this.callTimeout      = options.callTimeout      || 8000;
    this.state            = "CLOSED";
    this.failureCount     = 0;
    this.successCount     = 0;
    this.nextAttemptTime  = null;
  }

  async call(fn, fallback) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttemptTime) {
        console.warn(`[CircuitBreaker:${this.name}] OPEN — using fallback`);
        return fallback ? fallback() : null;
      }
      this.state = "HALF-OPEN";
      this.successCount = 0;
    }
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Call timeout")), this.callTimeout))
      ]);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      console.error(`[CircuitBreaker:${this.name}] Failure:`, err.message);
      return fallback ? fallback() : null;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF-OPEN") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
        console.log(`[CircuitBreaker:${this.name}] CLOSED — recovered`);
      }
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.state === "HALF-OPEN" || this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttemptTime = Date.now() + this.timeout;
      console.error(`[CircuitBreaker:${this.name}] OPEN — retry after ${this.timeout/1000}s`);
    }
  }

  isOpen()     { return this.state === "OPEN"; }
  isClosed()   { return this.state === "CLOSED"; }
  isHalfOpen() { return this.state === "HALF-OPEN"; }
}

const breakers = {
  llm:         new CircuitBreaker("llm-api",      { callTimeout: 10000 }),
  vectorStore: new CircuitBreaker("vector-store",  { callTimeout: 3000  }),
  dynamodb:    new CircuitBreaker("dynamodb",      { callTimeout: 2000  }),
  openSearch:  new CircuitBreaker("opensearch",    { callTimeout: 3000  })
};

module.exports = { CircuitBreaker, breakers };
