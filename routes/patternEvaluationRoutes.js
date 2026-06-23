const express = require("express");
const patternEvaluationController = require("../controllers/patternEvaluationController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

const guardEvaluator = (req, res, next) => {
  if (!res.locals.aiEvaluatorEnabled) {
    req.flash("error", "ميزة تحسين الباترنات غير متاحة حالياً.");
    return res.redirect("/");
  }
  next();
};

router.get("/evaluate_pattern", loggedin, guardEvaluator, patternEvaluationController.getPage);
router.post(
  "/api/evaluate_pattern",
  loggedin,
  guardEvaluator,
  express.json({ limit: "20mb" }),
  patternEvaluationController.evaluatePattern
);
router.get("/my_evaluations", loggedin, guardEvaluator, patternEvaluationController.getEvaluations);

module.exports = router;
