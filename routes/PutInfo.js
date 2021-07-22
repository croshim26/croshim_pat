const path = require('path');

const express = require('express');

const PutInfo = require('../controllers/PutInfo');
const loggedin=require("../middleware/loggedin")

const router = express.Router();






router.get("/places_lessor",loggedin,PutInfo.getPlacesLessor)



router.get("/add_places_lessor",loggedin,PutInfo.getAddPlacesLessor)

router.post("/add_places_lessor",loggedin,PutInfo.postAddPlacesLessor)

router.get("/account_places_lessor",loggedin,PutInfo.getEditPlacesLessor)

router.post("/account_places_lessor",loggedin,PutInfo.postEditPlacesLessor)


router.get("/delete_places_lessor",loggedin,PutInfo.getDeletePlacesLessor)

router.post("/delete_places_lessor",loggedin,PutInfo.postDeletePlacesLessor)

///////////////////








router.post('/logout',PutInfo.postLogout);


/////////////

router.get("/Equipment_seller",loggedin,PutInfo.getEquipment)


router.get("/add_equipment",loggedin,PutInfo.getAdd_eq)

router.post("/add_equipment",loggedin,PutInfo.postAdd_eq)

router.get("/equipment_edit",loggedin,PutInfo.getEq_edit)

router.post("/equipment_edit",loggedin,PutInfo.postEq_edit)

router.get("/delete_Equipment_seller",loggedin,PutInfo.getDeleteEquipment)

router.post("/delete_Equipment_seller",loggedin,PutInfo.postDeleteEquipment)

//////


router.get("/add_courses",loggedin,PutInfo.getAdd_courses)


router.post("/add_courses",loggedin,PutInfo.postAdd_courses)


router.get("/delete_course",loggedin,PutInfo.getDeleteCourse)

router.post("/delete_course",loggedin,PutInfo.postDeleteCourse)





router.get("/courses",loggedin,PutInfo.getCourses)




module.exports = router; 