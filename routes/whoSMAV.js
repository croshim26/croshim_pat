const path = require('path');

const express = require('express');

const whoSMAVController = require('../controllers/WhoSMAV');


const router = express.Router();






router.get("/whoSMAV",whoSMAVController.getWhoSMAV)





module.exports = router; 