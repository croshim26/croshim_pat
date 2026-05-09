const express = require("express");
const aiProductController = require("../controllers/aiProductController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

router.get("/request_pattern", loggedin,aiProductController.getRequestPattern);
router.post("/api/generate_pattern", loggedin,aiProductController.generatePattern);
router.get("/ai_product", loggedin,aiProductController.getAiProducts);

module.exports = router;
