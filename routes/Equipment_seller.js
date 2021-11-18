
const path = require('path');

const express = require('express');

const equipmentController = require('../controllers/Equipment_seller');
const loggedin=require("../middleware/loggedin")

const router = express.Router();




router.get("/Equipment_sellerLlogin",equipmentController.getLogin)

router.post("/Equipment_sellerLogin",equipmentController.postLogin)



router.get("/Equipment_sellerRegister",equipmentController.getRegister)

router.post("/Equipment_sellerRegister",equipmentController.postRegister)


router.get('/Equipment_sellerReset', equipmentController.getReset);

router.post('/Equipment_sellerReset', equipmentController.postReset);

router.get('/Equipment_seller_new_password/:token', equipmentController.getNewPassword);

router.post('/Equipment_seller_new_password', equipmentController.postNewPassword);





module.exports = router;

