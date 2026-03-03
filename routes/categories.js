const express = require("express");
const router = express.Router();

const {protect ,adminOnly} = require("../middlewares/authMiddleware");
const {getAllCategories, createCategory, deleteCategory} = require("../controllers/categoriesController");

router.get("/all", getAllCategories);
router.post("/create", protect, adminOnly, createCategory);
router.delete("/delete/:id", protect, adminOnly, deleteCategory);

module.exports = router;