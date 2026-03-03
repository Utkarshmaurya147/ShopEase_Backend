const express = require("express");
const router = express.Router();
const { handleContactForm } = require("../controllers/supportController");
const { protect } = require("../middlewares/authMiddleware"); 

router.post("/contact", protect, handleContactForm);

module.exports = router;