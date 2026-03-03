const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.get("/all", protect, getWishlist);
router.post("/add", protect, addToWishlist);
router.delete("/remove/:id", protect, removeFromWishlist);

module.exports = router;
