const express = require("express");

const productController = require("../controllers/productController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

router.get("/dashboard", loggedin, productController.getProducts);

router.get("/add_product", loggedin, productController.getAddProduct);

router.post("/add_product", loggedin, productController.createProduct);

router.get("/all-products", productController.getAllProducts);

router.post("/delete_product/:productId", loggedin, productController.deleteProduct);

module.exports = router;