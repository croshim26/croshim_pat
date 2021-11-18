const path = require('path');

const express = require('express');

const putInfo_placeLessore = require('../controllers/putInfo_placeLessore');
const loggedin=require("../middleware/loggedin")

const router = express.Router();






router.get("/places_lessor",loggedin,putInfo_placeLessore.getPlacesLessor)



router.get("/add_places_lessor",loggedin,putInfo_placeLessore.getAddPlacesLessor)

router.post("/add_places_lessor",loggedin,putInfo_placeLessore.postAddPlacesLessor)

router.get("/account_places_lessor",loggedin,putInfo_placeLessore.getEditPlacesLessor)

router.post("/account_places_lessor",loggedin,putInfo_placeLessore.postEditPlacesLessor)


router.get("/delete_places_lessor",loggedin,putInfo_placeLessore.getDeletePlacesLessor)

router.post("/delete_places_lessor",loggedin,putInfo_placeLessore.postDeletePlacesLessor)

///////////////////





module.exports = router; 