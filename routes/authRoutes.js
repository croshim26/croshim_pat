const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

/* =========================================================
   Auth Routes
   ========================================================= */

// Login
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// Register
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

// Logout
router.post("/logout", authController.postLogout);

module.exports = router;