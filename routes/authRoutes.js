const express = require("express");

const authController = require("../controllers/authController");
const loggedin = require("../middleware/loggedin");

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

// Profile
router.get("/profile", loggedin, authController.getProfile);
router.post("/profile", loggedin, authController.postProfile);
router.post("/profile/password", loggedin, authController.postProfilePassword);

// Forgot / Reset password
router.get("/reset", authController.getResetRequest);
router.post("/reset", authController.postResetRequest);
router.get("/reset/:token", authController.getResetPassword);
router.post("/reset/:token", authController.postResetPassword);

module.exports = router;