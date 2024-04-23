const express = require("express");
const router = express.Router();
const { getCampaignById } = require("./debugController");

router.route("/getCampaign/:id").get(getCampaignById);

module.exports = router;
