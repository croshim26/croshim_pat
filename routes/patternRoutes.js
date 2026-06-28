const express = require("express");
const router  = express.Router();

const SavedPattern = require("../models/saved_pattern");

const DEFAULT_ABBR = [
  { key: "MR",   val: "magic ring / magic loop" },
  { key: "Ch",   val: "chain" },
  { key: "sc",   val: "single crochet" },
  { key: "inc",  val: "increase (2 sc in 1 stitch)" },
  { key: "inc+", val: "3 sc in 1 stitch" },
  { key: "dec",  val: "decrease (sc 2 together)" },
  { key: "ss",   val: "slip stitch" },
  { key: "f/o",  val: "fasten off" },
];

/* ── Public pattern view ────────────────────────────────── */
router.get("/pattern/:id", async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (!pattern) {
      return res.status(404).render("pages/landing", {
        error_message: "الباترن غير موجود.",
        success_message: null,
      });
    }

    let tools = [], abbrs = [], parts = [];
    try { tools = JSON.parse(pattern.tools || "[]"); } catch (_) {}
    try { abbrs = JSON.parse(pattern.abbrs || "[]"); } catch (_) {}
    try { parts = JSON.parse(pattern.parts || "[]"); } catch (_) {}

    const allAbbrs = [...DEFAULT_ABBR, ...abbrs.filter(a => a.key)];

    res.render("pages/pattern_view", {
      pattern,
      tools,
      parts,
      allAbbrs,
      pageTitle: `${pattern.name} — Croshim Studio`,
      error_message: null,
      success_message: null,
    });
  } catch (err) {
    console.error("Pattern view error:", err);
    res.status(500).redirect("/");
  }
});


module.exports = router;
