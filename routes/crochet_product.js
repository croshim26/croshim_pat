const express = require("express");
const multer = require("multer");
const crochetController = require("../controllers/crochet_product");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

router.get("/home", crochetController.getproduct);

router.get("/add_product", crochetController.getAddProduct);

// ✅ multer runs here so req.body + req.file exist for multipart
router.post("/add_product",crochetController.postAddProduct);


router.get("/display_product", crochetController.getdisplay_product);

router.post("/delete_product/:productId", crochetController.deleteProduct);


module.exports = router;