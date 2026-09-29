const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.post("/analytics/track", analyticsController.track);

module.exports = router;
