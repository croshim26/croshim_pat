const path = require('path');

const express = require('express');

const sign_upController = require('../controllers/sign_up_group');


const router = express.Router();






router.get("/sign_up_group",sign_upController.getRegister)

router.post("/sign_up_group",sign_upController.postRegister)

router.get("/login_group",sign_upController.getLogin)

router.post("/login_group",sign_upController.postLogin)



router.get('/groupReset', sign_upController.getResetGroup);

router.post('/groupReset', sign_upController.postResetGroup);

router.get('/group_new_password/:token', sign_upController.getNewPasswordGroup);

router.post('/group_new_password', sign_upController.postNewPasswordGroup);



module.exports = router; 