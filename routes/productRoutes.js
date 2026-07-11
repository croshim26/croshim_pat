const express = require("express");
const User = require("../models/user");
const productController = require("../controllers/productController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

const canUseBuilder = async (req, res, next) => {
  const user = await User.findByPk(req.session.userId);
  if (user && (user.can_use_pattern_builder || user.is_admin)) return next();
  req.flash("error", "ليس لديك صلاحية استخدام Pattern Builder.");
  res.redirect("/dashboard");
};

router.get("/dashboard", loggedin, productController.getProducts);
router.get("/add_product", loggedin, productController.getAddProduct);
router.post("/add_product", loggedin, productController.createProduct);
router.post("/delete_product/:productId", loggedin, productController.deleteProduct);

router.get("/pattern-builder", loggedin, canUseBuilder, productController.getPatternBuilder);
router.post("/pattern-builder/save", loggedin, canUseBuilder, productController.savePattern);
router.get("/pattern-builder/load/:id", loggedin, canUseBuilder, productController.loadPattern);
router.post("/pattern-builder/delete/:id", loggedin, canUseBuilder, productController.deletePattern);
router.post("/pattern-builder/save-pdf",        loggedin, canUseBuilder, productController.savePatternPdf);
router.post("/pattern-builder/save-as-product", loggedin, canUseBuilder, productController.savePatternAsProduct);

module.exports = router;