const path = require('path');

const express = require('express');

const sign_up_adminController = require('../controllers/sign_up_admin');


const router = express.Router();






router.get("/sign_up_admin",sign_up_adminController.getRegister)

router.post("/sign_up_admin",sign_up_adminController.postRegister)

router.get("/login_admin",sign_up_adminController.getLogin)

router.post("/login_admin",sign_up_adminController.postLogin)



module.exports = router; 