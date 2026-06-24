const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const admin = require("../controllers/adminController");

router.use(isAdmin);

router.get("/ezshm_crochem", admin.getDashboard);

router.get("/ezshm_crochem/users", admin.getUsers);
router.post("/ezshm_crochem/users/:id/toggle-admin", admin.toggleAdmin);
router.post("/ezshm_crochem/users/:id/delete", admin.deleteUser);

router.get("/ezshm_crochem/products", admin.getProducts);
router.post("/ezshm_crochem/products/:id/delete", admin.deleteProduct);


router.get("/ezshm_crochem/saved-patterns", admin.getSavedPatternsPage);
router.post("/ezshm_crochem/saved-patterns/:id/delete", admin.deleteSavedPatternFromList);

router.get("/ezshm_crochem/pattern-builder", admin.getPatternBuilder);
router.post("/ezshm_crochem/pattern-builder/save", admin.savePattern);
router.get("/ezshm_crochem/pattern-builder/load/:id", admin.loadPattern);
router.post("/ezshm_crochem/pattern-builder/delete/:id", admin.deletePattern);
router.get("/ezshm_crochem/pattern-builder/pdf/:id", admin.downloadPatternPdf);

router.get("/ezshm_crochem/instagram",              admin.getInstagramPage);
router.post("/ezshm_crochem/instagram/settings",    admin.saveInstagramSettings);
router.post("/ezshm_crochem/instagram/refresh",     admin.refreshInstagramToken);
router.post("/ezshm_crochem/instagram/post",        admin.postInstagram);

module.exports = router;
