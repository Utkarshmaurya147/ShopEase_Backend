var express = require('express');
var router = express.Router();
const {protect, adminOnly} = require("../middlewares/authMiddleware");
const {getDashboardStats, getAnalytics} = require("../controllers/adminController");

router.get("/analytics", adminOnly, getAnalytics);

module.exports = router;
