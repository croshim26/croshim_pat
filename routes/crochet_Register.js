
const path = require('path');

const express = require('express');

const crochetController = require('../controllers/crochet_Register');
// const loggedin=require("../middleware/loggedin")

const router = express.Router();




router.get("/login",crochetController.getLogin)
router.post("/login",crochetController.postLogin)



router.get("/crochet_Register",crochetController.getRegister)

router.post("/crochet_Register",crochetController.postRegister)

router.post('/logout',crochetController.postLogout);

module.exports = router;

// router.get('/Equipment_sellerReset', equipmentController.getReset);

// router.post('/Equipment_sellerReset', equipmentController.postReset);

// router.get('/Equipment_seller_new_password/:token', equipmentController.getNewPassword);

// router.post('/Equipment_seller_new_password', equipmentController.postNewPassword);



