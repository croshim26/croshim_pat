const { v4: uuidv4 } = require("uuid");
const EngagementEvent = require("../models/engagement_event");
const Product = require("../models/product");
const SavedPattern = require("../models/saved_pattern");

const ALLOWED_EVENTS = new Set([
  "pattern_view",
  "product_file_open",
  "access_request_created",
]);

const getVisitorId = (req, res) => {
  const existing = req.cookies?.croshim_visitor_id;
  if (typeof existing === "string" && /^[a-f0-9-]{36}$/i.test(existing)) return existing;

  const visitorId = uuidv4();
  res.cookie("croshim_visitor_id", visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 365,
    path: "/",
  });
  return visitorId;
};

const validId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

async function recordEngagementEvent({ req, res, eventName, productId, patternId }) {
  if (!ALLOWED_EVENTS.has(eventName)) return false;

  const normalizedProductId = validId(productId);
  const normalizedPatternId = validId(patternId);
  const viewerId = req.session.userId || null;

  if (eventName === "pattern_view" && !normalizedPatternId) return false;
  if (eventName !== "pattern_view" && !normalizedProductId) return false;

  if (normalizedProductId) {
    const product = await Product.findByPk(normalizedProductId, { attributes: ["id", "user_id"] });
    if (!product || (viewerId && Number(product.user_id) === Number(viewerId))) return false;
  }

  if (normalizedPatternId) {
    const pattern = await SavedPattern.findByPk(normalizedPatternId, { attributes: ["id", "created_by"] });
    if (!pattern || (viewerId && Number(pattern.created_by) === Number(viewerId))) return false;
  }

  await EngagementEvent.create({
    event_name: eventName,
    product_id: normalizedProductId,
    pattern_id: normalizedPatternId,
    user_id: viewerId,
    visitor_id: getVisitorId(req, res),
  });
  return true;
}

module.exports = { ALLOWED_EVENTS, recordEngagementEvent };
