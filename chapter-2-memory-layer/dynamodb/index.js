/**
 * Chapter 2 — Memory Layer: DynamoDB
 * Structured memory: incidents, deployments, operational learnings.
 * Author: Abhay Kumar Chaudhary
 */
const { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" });
const TTL_DAYS = 90;

async function writeIncident(event) {
  const item = {
    PK:            `SERVICE#${event.source}`,
    SK:            `INCIDENT#${event.timestamp}#${event.eventId}`,
    incidentId:    event.eventId,
    service:       event.source,
    severity:      event.severity,
    type:          event.type,
    errorRate:     event.payload.errorRate,
    endpoint:      event.payload.endpoint,
    deployVersion: event.enrichment?.activeDeployment?.version || null,
    minutesSinceDeploy: event.enrichment?.minutesSinceDeploy   || null,
    status:        "OPEN",
    embeddingId:   null,
    ttl:           Math.floor(Date.now() / 1000) + (TTL_DAYS * 86400)
  };
  await client.send(new PutItemCommand({ TableName: "incidents", Item: marshall(item) }));
  return item;
}

async function getRecentIncidents(service, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const result = await client.send(new QueryCommand({
    TableName: "incidents",
    KeyConditionExpression: "PK = :pk AND SK BETWEEN :start AND :end",
    ExpressionAttributeValues: marshall({
      ":pk":    `SERVICE#${service}`,
      ":start": `INCIDENT#${cutoff.toISOString()}`,
      ":end":   `INCIDENT#${new Date().toISOString()}`
    })
  }));
  return result.Items.map(unmarshall);
}

async function getDeploymentAtTime(service, timestamp) {
  const result = await client.send(new QueryCommand({
    TableName: "deployments",
    KeyConditionExpression: "PK = :pk AND SK <= :ts",
    ExpressionAttributeValues: marshall({ ":pk": `SERVICE#${service}`, ":ts": `DEPLOY#${timestamp}` }),
    ScanIndexForward: false,
    Limit: 1
  }));
  return result.Items.length ? unmarshall(result.Items[0]) : null;
}

async function closeIncident(incidentId, resolution) {
  await client.send(new UpdateItemCommand({
    TableName: "incidents",
    Key: marshall({ PK: `INCIDENT#${incidentId}` }),
    UpdateExpression: "SET #status = :s, resolution = :r, mttrMinutes = :m, resolvedAt = :t",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: marshall({
      ":s": "RESOLVED", ":r": resolution.action,
      ":m": resolution.mttrMinutes, ":t": new Date().toISOString()
    })
  }));
}

module.exports = { writeIncident, getRecentIncidents, getDeploymentAtTime, closeIncident };
