const { ALLOWED_EVENTS, USER_ACTIVITY_EVENTS, recordEngagementEvent, recordUserActivity } = require("../util/analytics");

exports.track = async (req, res) => {
  try {
    const eventName = String(req.body.eventName || "");
    if (!ALLOWED_EVENTS.has(eventName)) return res.status(400).json({ success: false });

    await recordEngagementEvent({
      req,
      res,
      eventName,
      productId: req.body.productId,
      patternId: req.body.patternId,
    });
    return res.status(204).end();
  } catch (error) {
    // Analytics must never interrupt a visitor's normal product or pattern flow.
    console.error("Analytics tracking error:", error.message);
    return res.status(204).end();
  }
};

exports.trackActivity = async (req, res) => {
  try {
    const eventName = String(req.body.eventName || "");
    if (!USER_ACTIVITY_EVENTS.has(eventName)) return res.status(400).json({ success: false });
    await recordUserActivity({
      req,
      eventName,
      pagePath: req.body.pagePath,
      durationSeconds: req.body.durationSeconds,
    });
  } catch (error) {
    console.error("User activity tracking error:", error.message);
  }
  return res.status(204).end();
};
