
const path = require('path');

const express = require('express');

const displayInfo = require('../controllers/displayInfo');
// const loggedin=require("../middleware/loggedin")

const router = express.Router();




router.get("/displayEquipment",displayInfo.getDisplayEquipments)

router.post("/displayEquipment",displayInfo.postDisplayEquipments)

// 

router.get("/displayPlace",displayInfo.getDisplayPlace)

router.post("/displayPlace",displayInfo.postDisplayPlace)

//
router.get("/displayCourses",displayInfo.getDisplayCourses)

module.exports = router;
