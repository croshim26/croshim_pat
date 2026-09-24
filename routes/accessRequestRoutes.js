const express = require("express");
const loggedin = require("../middleware/loggedin");
const controller = require("../controllers/accessRequestController");

const router = express.Router();

// Owner manages incoming requests
router.get(
  "/access-requests/received",
  loggedin,
  controller.listReceived
);

// User follows requests they sent
router.get(
  "/access-requests/sent",
  loggedin,
  controller.listSent
);

// One request details — must stay after received and sent
router.get(
  "/access-requests/:id",
  loggedin,
  controller.show
);

router.post("/products/:id/request-access", loggedin, controller.create);

router.get("/product-access-requests", loggedin, controller.getProductAccessRequests);

router.post("/access-requests/:id/messages", loggedin, controller.sendMessage);

router.post(
  "/access-requests/:id/status/:status",
  loggedin,
  controller.setStatus
);

module.exports = router;
