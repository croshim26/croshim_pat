const API = "https://graph.facebook.com/v20.0";

/* ── Verify token + get account info ───────────────────── */
async function verifyAccount(igUserId, accessToken) {
  const url = `${API}/${igUserId}?fields=id,username,profile_picture_url&access_token=${accessToken}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data; // { id, username, profile_picture_url }
}

/* ── Refresh long-lived token (extends by 60 days) ─────── */
async function refreshToken(accessToken) {
  const url  = `${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data; // { access_token, token_type, expires_in }
}

/* ── Publish a photo post ───────────────────────────────── */
async function publishPhoto(igUserId, accessToken, imageUrl, caption) {
  // Step 1 — create media container
  const containerRes = await fetch(`${API}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(container.error.message);

  // Step 2 — publish
  const publishRes = await fetch(`${API}/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
  });
  const published = await publishRes.json();
  if (published.error) throw new Error(published.error.message);

  return published; // { id }
}

module.exports = { verifyAccount, refreshToken, publishPhoto };
