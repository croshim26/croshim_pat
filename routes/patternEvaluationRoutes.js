const express = require("express");
const patternEvaluationController = require("../controllers/patternEvaluationController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

router.get("/evaluate_pattern", loggedin, patternEvaluationController.getPage);
router.post(
  "/api/evaluate_pattern",
  loggedin,
  express.json({ limit: "20mb" }),
  patternEvaluationController.evaluatePattern
);
router.get("/my_evaluations", loggedin, patternEvaluationController.getEvaluations);

module.exports = router;
