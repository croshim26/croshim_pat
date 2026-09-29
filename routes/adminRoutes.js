const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const admin = require("../controllers/adminController");

router.use(isAdmin);

/* ── Dashboard ─────────────────────────────────────────── */
router.get("/ezshm_crochem", admin.getDashboard);

/* ── Users ─────────────────────────────────────────────── */
router.get("/ezshm_crochem/users", admin.getUsers);
router.post("/ezshm_crochem/users/:id/toggle-admin", admin.toggleAdmin);
router.post("/ezshm_crochem/users/:id/set-pattern-limit", admin.setPatternLimit);
router.post("/ezshm_crochem/users/:id/delete", admin.deleteUser);

/* ── Products ──────────────────────────────────────────── */
router.get("/ezshm_crochem/products", admin.getProducts);
router.post("/ezshm_crochem/products/:id/toggle-published", admin.toggleProductPublished);
router.post("/ezshm_crochem/products/:id/toggle-pattern-published", admin.togglePatternPublished);
router.post("/ezshm_crochem/products/:id/delete", admin.deleteProduct);

/* ── Saved patterns ───────────────────────────────────── */
router.get("/ezshm_crochem/saved-patterns", admin.getSavedPatternsPage);
router.post("/ezshm_crochem/saved-patterns/:id/delete", admin.deleteSavedPatternFromList);

/* ── Suggestions & Complaints ──────────────────────────── */
router.get("/ezshm_crochem/feedback", admin.getFeedback);
router.post("/ezshm_crochem/feedback/:id/delete", admin.deleteFeedback);

module.exports = router;
