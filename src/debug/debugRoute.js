const express = require("express");
const router = express.Router();
const { getContractAddress, getTransactions } = require("./debugController");
const verifyToken = require("../middleware/verifyToken");

router.route("/contract-address").get(verifyToken, getContractAddress);
router.route("/transactions").get(verifyToken, getTransactions);

module.exports = router;
