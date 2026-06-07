/**
 * Chapter 4 — Action Layer: Notifier
 * Sends structured Slack messages + PagerDuty alerts.
 * Includes approve/reject buttons for human-in-the-loop gate.
 * Author: Abhay Kumar Chaudhary
 */
const { WebClient } = require("@slack/web-api");
const axios         = require("axios");
const slack         = new WebClient(process.env.SLACK_BOT_TOKEN);

const URGENCY_EMOJI = {
  "immediate":     "🔴",
  "within-15-min": "🟠",
  "within-1-hour": "🟡",
  "low":           "🟢"
};

function buildSlackMessage(rec) {
  const emoji = URGENCY_EMOJI[rec.action.urgency] || "⚪";
  return {
    channel: process.env.SLACK_INCIDENTS_CHANNEL || "#incidents",
    blocks: [
      { type: "header", text: { type: "plain_text", text: `${emoji} Thinking Backend — ${rec.incident.severity} Incident` } },
      { type: "section", fields: [
        { type: "mrkdwn", text: `*Service:*\n${rec.incident.service}` },
        { type: "mrkdwn", text: `*Users affected:*\n${rec.impact.usersAffected.toLocaleString()}` },
        { type: "mrkdwn", text: `*Revenue at risk:*\n${rec.impact.revenueAtRisk}` },
        { type: "mrkdwn", text: `*Confidence:*\n${rec.diagnosis.confidencePercent}` }
      ]},
      { type: "divider" },
      { type: "section", text: { type: "mrkdwn", text: `*What the system thinks:*\n${rec.diagnosis.explanation}` } },
      { type: "section", text: { type: "mrkdwn", text: `*Recommended action:*\n${rec.action.detail}` } },
      rec.diagnosis.caveat ? { type: "section", text: { type: "mrkdwn", text: `*Check before acting:*\n${rec.diagnosis.caveat}` } } : null,
      { type: "actions", elements: [
        { type: "button", text: { type: "plain_text", text: "Approve & Execute" }, style: "primary",
          value: JSON.stringify({ recommendationId: rec.recommendationId, action: "approve" }), action_id: "approve_action" },
        { type: "button", text: { type: "plain_text", text: "Reject" }, style: "danger",
          value: JSON.stringify({ recommendationId: rec.recommendationId, action: "reject" }), action_id: "reject_action" }
      ]}
    ].filter(Boolean)
  };
}

async function notify(rec) {
  const message    = buildSlackMessage(rec);
  const slackResult = await slack.chat.postMessage(message);
  if (rec.incident.severity === "P1") await triggerPagerDuty(rec);
  return slackResult.ts;
}

async function triggerPagerDuty(rec) {
  await axios.post("https://events.pagerduty.com/v2/enqueue", {
    routing_key:  process.env.PAGERDUTY_ROUTING_KEY,
    event_action: "trigger",
    payload: {
      summary:  `P1: ${rec.diagnosis.rootCause}`,
      source:   rec.incident.service,
      severity: "critical",
      custom_details: { confidence: rec.diagnosis.confidencePercent, usersAffected: rec.impact.usersAffected }
    },
    dedup_key: rec.recommendationId
  });
}

module.exports = { notify };
