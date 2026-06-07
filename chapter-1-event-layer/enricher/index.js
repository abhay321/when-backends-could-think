/**
 * Chapter 1 — Event Layer: Enricher
 * Adds deployment context, service config, and SLA tier to every event.
 * Author: Abhay Kumar Chaudhary
 */
async function enrichEvent(event, { getActiveDeployment, getServiceConfig, getSLATier }) {
  const [deployment, serviceConfig, slaTier] = await Promise.all([
    getActiveDeployment(event.source, event.timestamp),
    getServiceConfig(event.source),
    getSLATier(event.source)
  ]);

  const minutesSinceDeploy = deployment
    ? Math.floor((new Date(event.timestamp) - new Date(deployment.deployedAt)) / 60000)
    : null;

  return {
    ...event,
    enrichment: {
      activeDeployment: deployment ? {
        version:    deployment.version,
        deployedAt: deployment.deployedAt,
        deployedBy: deployment.author,
        commitSha:  deployment.sha
      } : null,
      service: {
        owner:             serviceConfig.team,
        slaTier,
        revenuePerRequest: serviceConfig.revenuePerRequest || 0
      },
      minutesSinceDeploy
    }
  };
}

module.exports = { enrichEvent };
