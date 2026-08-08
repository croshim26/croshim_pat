const express = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const loggedin = require("../middleware/loggedin");

const router = express.Router();

/* =========================================================
   Rate Limiters
   ========================================================= */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many accounts created from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many password reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================================================
   Auth Routes
   ========================================================= */

// Login
router.get("/login", authController.getLogin);
router.post("/login", loginLimiter, authController.postLogin);

// Register
router.get("/register", authController.getRegister);
router.post("/register", registerLimiter, authController.postRegister);

// Logout
router.post("/logout", authController.postLogout);

// Profile
router.get("/profile", loggedin, authController.getProfile);
router.post("/profile", loggedin, authController.postProfile);
router.post("/profile/password", loggedin, authController.postProfilePassword);

// Forgot / Reset password
router.get("/reset", authController.getResetRequest);
router.post("/reset", resetLimiter, authController.postResetRequest);
router.get("/reset/:token", authController.getResetPassword);
router.post("/reset/:token", resetLimiter, authController.postResetPassword);

module.exports = router;