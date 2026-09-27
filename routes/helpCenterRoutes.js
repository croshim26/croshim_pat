const express = require("express");
const helpCenterController = require("../controllers/helpCenterController");

const router = express.Router();

router.get("/help-center", helpCenterController.getHelpCenter);

module.exports = router;
