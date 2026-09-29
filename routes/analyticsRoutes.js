const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.post("/analytics/track", analyticsController.track);
router.post("/analytics/activity", analyticsController.trackActivity);

module.exports = router;
