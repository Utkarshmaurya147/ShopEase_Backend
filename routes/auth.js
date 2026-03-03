var express = require('express');
var router = express.Router();
const {protect} = require("../middlewares/authMiddleware");
const {login, signup, getMe, logout, verifyOTP, resendOTP} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

module.exports = router;
