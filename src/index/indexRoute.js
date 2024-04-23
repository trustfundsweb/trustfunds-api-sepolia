const express = require("express");
const router = express.Router();
const welcome = require("./indexController");

router.route("/").get(welcome);

module.exports = router;
