const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware");
const {createRazorpayOrder, verifyPayment, razorpayWebhook} = require("../controllers/paymentController");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", razorpayWebhook);

module.exports = router;