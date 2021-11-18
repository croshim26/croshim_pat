

const path = require('path');

const express = require('express');

const admin = require('../controllers/admin');

const loggedin=require("../middleware/loggedin")


const router = express.Router();


router.get("/display_place",loggedin,admin.getadminPlace)

router.get("/display_Equip",loggedin,admin.getadminEquip)

router.get("/display_Course",loggedin,admin.getadminCourse)



router.get("/accept_Course",loggedin,admin.getCourseAccept)

router.post("/accept_Course",loggedin,admin.postCourseAccept)


router.get("/refuse_Course",loggedin,admin.getCourseRefuse)

router.post("/refuse_Course",loggedin,admin.postCourseRefuse)



router.get("/wait_Course",loggedin,admin.getCourseWait)

router.post("/wait_Course",loggedin,admin.postCourseWait)

///////


router.get("/accept_Equip",loggedin,admin.getEquipAccept)

router.post("/accept_Equip",loggedin,admin.postEquipAccept)


router.get("/refuse_Equip",loggedin,admin.getEquipRefuse)

router.post("/refuse_Equip",loggedin,admin.postEquipRefuse)



router.get("/wait_Equip",loggedin,admin.getEquipWait)

router.post("/wait_Equip",loggedin,admin.postEquipWait)

///////



router.get("/accept_Place",loggedin,admin.getPlaceAccept)

router.post("/accept_Place",loggedin,admin.postPlaceAccept)


router.get("/refuse_Place",loggedin,admin.getPlaceRefuse)

router.post("/refuse_Place",loggedin,admin.postPlaceRefuse)



router.get("/wait_Place",loggedin,admin.getPlaceWait)

router.post("/wait_Place",loggedin,admin.postPlaceWait)





















router.post('/logout',admin.postLogout);





module.exports = router; 