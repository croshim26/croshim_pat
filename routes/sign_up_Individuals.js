const path = require('path');

const express = require('express');

const sign_upController = require('../controllers/sign_up_Individuals');


const router = express.Router();






router.get("/sign_up_Individuals",sign_upController.getRegister)

router.post("/sign_up_Individuals",sign_upController.postRegister)

router.get("/login_Individuals",sign_upController.getLogin)

router.post("/login_Individuals",sign_upController.postLogin)



router.get('/IndividualsReset', sign_upController.getResetIndividuals);

router.post('/IndividualsReset', sign_upController.postResetIndividuals);

router.get('/Individuals_new_password/:token', sign_upController.getNewPasswordIndividuals);

router.post('/Individuals_new_password', sign_upController.postNewPasswordIndividuals);











module.exports = router; 