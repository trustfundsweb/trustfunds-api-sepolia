const express = require("express");
const router = express.Router();
const { getCampaignById, getContractAddress } = require("./debugController");
const verifyToken = require("../middleware/verifyToken");

router.route("/getCampaign/:id").get(getCampaignById);
router.route("/contract-address").get(verifyToken, getContractAddress);

module.exports = router;
