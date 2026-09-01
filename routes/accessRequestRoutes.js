const express = require("express");
const loggedin = require("../middleware/loggedin");
const controller = require("../controllers/accessRequestController");

const router = express.Router();

router.post("/products/:id/request-access", loggedin, controller.create);
router.get("/access-requests", loggedin, controller.list);
router.get("/access-requests/:id", loggedin, controller.show);
router.post("/access-requests/:id/messages", loggedin, controller.sendMessage);
router.post("/access-requests/:id/approved", loggedin, (req, res, next) => {
  req.params.status = "approved";
  return controller.setStatus(req, res, next);
});
router.post("/access-requests/:id/rejected", loggedin, (req, res, next) => {
  req.params.status = "rejected";
  return controller.setStatus(req, res, next);
});

module.exports = router;
