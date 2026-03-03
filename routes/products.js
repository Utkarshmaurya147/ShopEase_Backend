const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const upload = require("../middlewares/upload");
const { protect, adminOnly} = require("../middlewares/authMiddleware");

// public routes
router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.get("/category/:slug", getProductsByCategory);

// admin routes
router.post("/create", protect, upload.single("image"), createProduct);
router.post("/update/:id", protect, adminOnly, upload.single("image") ,updateProduct);
router.delete("/delete/:id", protect, adminOnly, deleteProduct);


module.exports = router;
