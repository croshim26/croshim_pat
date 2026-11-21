const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const isTurnstileConfigured = () => Boolean(
  process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
);

async function verifyTurnstile({ token, remoteIp }) {
  if (!isTurnstileConfigured()) return { success: false, reason: "not_configured" };
  if (!token) return { success: false, reason: "missing_token" };

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { success: false, reason: "verification_unavailable" };
    const result = await response.json();
    return { success: result.success === true, reason: result.success ? null : "verification_failed" };
  } catch (error) {
    console.error("Turnstile verification error:", error.message);
    return { success: false, reason: "verification_unavailable" };
  }
}

module.exports = { isTurnstileConfigured, verifyTurnstile };
