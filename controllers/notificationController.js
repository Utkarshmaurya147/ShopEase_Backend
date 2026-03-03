const { Notification } = require("../models");
require("dotenv").config();

// Get all notifications for the logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // Newest first
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update({ isRead: true }, { where: { id, userId: req.user.id } });
    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark ALL as read
const markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {getMyNotifications, markAllRead, markAsRead};