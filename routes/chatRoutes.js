const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/api/chat", chatController.chat);

module.exports = router;
