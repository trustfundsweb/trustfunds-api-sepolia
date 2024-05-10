const express = require("express");
const router = express.Router();
const {
  getAllMessages,
  sendMessage,
  getCampaignMessages,
} = require("./forumController");
const verifyToken = require("../middleware/verifyToken");

// router.route("/").get(getAllMessages);
router.route("/:id").get(getCampaignMessages);
router.route("/:id").post(verifyToken, sendMessage);

module.exports = router;
