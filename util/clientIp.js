const net = require("net");

function getClientIp(req) {
  const candidates = [req.ip, req.socket?.remoteAddress];
  for (const value of candidates) {
    const ip = String(value || "").trim().replace(/^::ffff:/, "");
    if (net.isIP(ip)) return ip;
  }
  return null;
}

function getRegistrationCountry(req) {
  const country = String(req.get("cf-ipcountry") || req.get("x-vercel-ip-country") || "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
}

module.exports = { getClientIp, getRegistrationCountry };
