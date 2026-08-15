const express = require("express");
const rateLimit = require("express-rate-limit");

const feedbackController = require("../controllers/feedbackController");

const router = express.Router();

/* Public page, so cap how often one IP can post. */
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many messages sent. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* No auth middleware — this page is visible to everyone. */
router.get("/feedback", feedbackController.getFeedbackPage);
router.post("/feedback", feedbackLimiter, feedbackController.postFeedback);

module.exports = router;
