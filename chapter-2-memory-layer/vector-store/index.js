/**
 * Chapter 2 — Memory Layer: Vector Store
 * Semantic memory using pgvector. Finds similar past incidents
 * even when they share no keywords — only conceptual similarity.
 * Author: Abhay Kumar Chaudhary
 */
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { Client } = require("pg");

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "ap-south-1" });

function buildIncidentText(event) {
  return [
    `Severity: ${event.severity}`,
    `Service: ${event.source}`,
    `Type: ${event.type}`,
    `Endpoint: ${event.payload.endpoint || "unknown"}`,
    `Error rate: ${event.payload.errorRate}% (baseline: ${event.payload.baseline}%)`,
    `Minutes since last deploy: ${event.enrichment?.minutesSinceDeploy || "unknown"}`,
    `Deploy version: ${event.enrichment?.activeDeployment?.version || "none"}`,
    `Region: ${event.region}`
  ].join(". ");
}

async function generateEmbedding(text) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId:     "amazon.titan-embed-text-v1",
    contentType: "application/json",
    body:        JSON.stringify({ inputText: text })
  }));
  const result = JSON.parse(Buffer.from(response.body).toString());
  return result.embedding;
}

async function storeEmbedding(incidentId, vector, metadata) {
  const db = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await db.connect();
  await db.query(
    `INSERT INTO incident_embeddings (incident_id, service, severity, timestamp, resolution, embedding)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [incidentId, metadata.service, metadata.severity, metadata.timestamp, null, JSON.stringify(vector)]
  );
  await db.end();
  return `emb_${incidentId}`;
}

async function findSimilarIncidents(currentEvent, topK = 3) {
  const text        = buildIncidentText(currentEvent);
  const queryVector = await generateEmbedding(text);
  const db          = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await db.connect();
  const result = await db.query(
    `SELECT incident_id, service, severity, timestamp, resolution,
            1 - (embedding <=> $1::vector) AS similarity
     FROM incident_embeddings
     WHERE resolution IS NOT NULL
       AND timestamp < NOW() - INTERVAL '10 minutes'
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(queryVector), topK]
  );
  await db.end();
  return result.rows;
}

async function updateResolution(incidentId, resolution, mttrMinutes) {
  const db = new Client({ connectionString: process.env.PG_CONNECTION_STRING });
  await db.connect();
  await db.query(
    `UPDATE incident_embeddings SET resolution = $1, mttr_minutes = $2, resolved_at = NOW() WHERE incident_id = $3`,
    [resolution, mttrMinutes, incidentId]
  );
  await db.end();
}

module.exports = { buildIncidentText, generateEmbedding, storeEmbedding, findSimilarIncidents, updateResolution };
