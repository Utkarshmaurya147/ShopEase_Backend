var express = require("express");
var router = express.Router();
const {protect, adminOnly} = require("../middlewares/authMiddleware");

const {
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  changePassword
} = require("../controllers/userController");

router.get("/all", protect, adminOnly, getAllUsers);
router.get("/:id", protect ,getSingleUser);
router.delete("/delete/:id", protect, adminOnly, deleteUser); // paranoid:- true
router.put("/update/:id", protect, updateUser);
router.put("/change-password", protect, changePassword);

module.exports = router;
