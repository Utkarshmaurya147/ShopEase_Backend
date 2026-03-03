const express = require("express");
const router = express.Router();
const { protect, adminOnly} = require("../middlewares/authMiddleware");
const {
  createOrder,
  getMyOrders,
  cancelOrder,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

router.get("/all", protect, getAllOrders);
router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.put("/cancel/:orderId", protect, cancelOrder);
router.get("/details/:orderId", protect, getOrderDetails);
router.put("/update-status/:orderId", protect, updateOrderStatus);

module.exports = router;
