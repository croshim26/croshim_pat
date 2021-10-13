

const path = require('path');

const express = require('express');

const admin = require('../controllers/admin');

const loggedin=require("../middleware/loggedin")


const router = express.Router();


router.get("/display_group",loggedin,admin.getadminGroup)

router.get("/display_users",loggedin,admin.getadminUsers)


router.get("/refuse_users",loggedin,admin.getRefuse)

router.post("/refuse_users",loggedin,admin.postRefuse)


router.get("/accept_users",loggedin,admin.getAccept)

router.post("/accept_users",loggedin,admin.postAccept)


router.get("/wait_users",loggedin,admin.getWait)

router.post("/wait_users",loggedin,admin.postWait)




router.get("/accept_group",loggedin,admin.getadminGroupAccept)

router.post("/accept_group",loggedin,admin.postAcceptGroup)


router.get("/wait_group",loggedin,admin.getWaitGroup)

router.post("/wait_group",loggedin,admin.postWaitGroup)





router.get("/refuse_group",loggedin,admin.getRefuseGroup)

router.post("/refuse_group",loggedin,admin.postRefuseGroup)
















router.get("/accept_users_excel",loggedin,admin.getAcceptExcel)

router.get("/display_usersAccept",loggedin,admin.getadminUsersAccept)

router.get("/display_usersRefuse",loggedin,admin.getadminUsersRefuse)


router.get("/display_usersWait",loggedin,admin.getadminUsersWait)

router.post("/display_usersWait",loggedin,admin.postadminUsersWait)





router.post('/logout',admin.postLogout);





module.exports = router; 