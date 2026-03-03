const express = require("express");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware");
const { getMyNotifications, markAsRead, markAllRead } = require("../controllers/notificationController");       

router.get("/my-notifications", protect, getMyNotifications);
router.put("/mark-read/:id", protect, markAsRead);
router.put("/mark-all-read", protect, markAllRead);

module.exports = router;