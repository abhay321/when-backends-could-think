/**
 * Chapter 1 — Event Layer: Elasticsearch Signal Collector
 * Collects ES-specific signals: index lag, JVM heap, search latency.
 * Used in Case Study 2 (Evolus loyalty platform).
 * Author: Abhay Kumar Chaudhary
 */
const { Client } = require("@elastic/elasticsearch");
const esClient = new Client({ node: process.env.ES_ENDPOINT });

async function collectIndexLag(emitEvent, getDynamoCount) {
  const [dynamoCount, esResult] = await Promise.all([
    getDynamoCount("loyalty_events"),
    esClient.count({ index: "loyalty_events" })
  ]);
  const lag        = dynamoCount - esResult.body.count;
  const lagPercent = (lag / dynamoCount) * 100;

  await emitEvent({
    source:   "elasticsearch-monitor",
    type:     "es.index.lag",
    severity: lagPercent > 5 ? "P1" : lagPercent > 1 ? "P2" : "INFO",
    payload:  { dynamoCount, esCount: esResult.body.count, lagDocuments: lag, lagPercent: lagPercent.toFixed(2) }
  });
}

async function collectJVMHealth(emitEvent) {
  const stats = await esClient.nodes.stats({ metric: ["jvm"] });
  for (const [nodeId, node] of Object.entries(stats.body.nodes)) {
    const heapPercent = node.jvm.mem.heap_used_percent;
    await emitEvent({
      source:   "elasticsearch-monitor",
      type:     "es.jvm.heap_pressure",
      severity: heapPercent > 85 ? "P1" : heapPercent > 75 ? "P2" : "INFO",
      payload:  { nodeId, heapPercent, fielddataEvictions: node.indices.fielddata.evictions }
    });
  }
}

module.exports = { collectIndexLag, collectJVMHealth };
