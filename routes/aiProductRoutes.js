const express = require("express");
const aiProductController = require("../controllers/aiProductController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

const guardGenerator = (req, res, next) => {
  if (!res.locals.aiGeneratorEnabled) {
    req.flash("error", "ميزة توليد الباترنات غير متاحة حالياً.");
    return res.redirect("/");
  }
  next();
};

router.get("/request_pattern", loggedin, guardGenerator, aiProductController.getRequestPattern);
router.post("/api/generate_pattern", loggedin, guardGenerator, aiProductController.generatePattern);
router.get("/ai_product", loggedin, guardGenerator, aiProductController.getAiProducts);

module.exports = router;
