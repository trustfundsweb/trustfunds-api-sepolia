const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
  logout,
  user,
  linkMetamask,
} = require("./userController");
const verifyToken = require("../middleware/verifyToken");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/change-password").post(verifyToken, changePassword);
router.route("/logout").get(verifyToken, logout);
router.route("/me").get(verifyToken, user);
router.route("/metamask").post(verifyToken, linkMetamask);

module.exports = router;
