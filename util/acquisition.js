const UserAcquisition = require("../models/user_acquisition");

const safeValue = (value, limit) => String(value || "").trim().slice(0, limit) || null;

function classifyAcquisition(req) {
  const source = safeValue(req.query.utm_source, 100);
  const medium = safeValue(req.query.utm_medium, 100);
  const campaign = safeValue(req.query.utm_campaign, 200);
  let host = null;
  try { host = new URL(req.get("referer") || "").hostname.toLowerCase() || null; } catch (_) { /* direct visit */ }
  if (source || medium || campaign) return { source: source || "campaign", medium: medium || "referral", campaign, referrerHost: host };
  if (!host) return { source: "direct", medium: "direct", campaign: null, referrerHost: null };
  if (/(^|\.)google\./.test(host)) return { source: "google", medium: "organic", campaign: null, referrerHost: host };
  if (/(^|\.)(bing|search\.yahoo|duckduckgo)\./.test(host)) return { source: host.split(".")[0], medium: "organic", campaign: null, referrerHost: host };
  if (/instagram\.com$/.test(host)) return { source: "instagram", medium: "social", campaign: null, referrerHost: host };
  if (/(facebook\.com|fb\.com)$/.test(host)) return { source: "facebook", medium: "social", campaign: null, referrerHost: host };
  if (/tiktok\.com$/.test(host)) return { source: "tiktok", medium: "social", campaign: null, referrerHost: host };
  return { source: host, medium: "referral", campaign: null, referrerHost: host };
}

function rememberAcquisition(req) {
  if (req.method !== "GET" || req.path.startsWith("/analytics/")) return;
  if (!req.session.acquisition) req.session.acquisition = classifyAcquisition(req);
}

async function attachAcquisitionToUser(req) {
  if (!req.session?.userId || !req.session.acquisition) return;
  const data = req.session.acquisition;
  const now = new Date();
  const existing = await UserAcquisition.findOne({ where: { user_id: req.session.userId } });
  if (!existing) {
    await UserAcquisition.create({ user_id: req.session.userId, first_source: data.source, first_medium: data.medium, first_campaign: data.campaign, first_referrer_host: data.referrerHost, first_seen_at: now, last_source: data.source, last_medium: data.medium, last_campaign: data.campaign, last_referrer_host: data.referrerHost, last_seen_at: now });
    return;
  }
  await existing.update({ last_source: data.source, last_medium: data.medium, last_campaign: data.campaign, last_referrer_host: data.referrerHost, last_seen_at: now });
}

module.exports = { rememberAcquisition, attachAcquisitionToUser };
