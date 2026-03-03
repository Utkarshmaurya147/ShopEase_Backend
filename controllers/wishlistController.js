const {Wishlist, Product} = require("../models");


// Get all wishlist items for logged-in user
const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.userId },
      include: [{ model: Product }] // Fetch product details (image, name, price)
    });
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    // Check if already exists
    const exists = await Wishlist.findOne({ where: { userId: req.userId, productId: productId } });
    if (exists) return res.status(400).json({ message: "Already in wishlist" });

    const newItem = await Wishlist.create({ userId: req.userId, productId: productId });
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user ? req.user.id : req.userId;
    console.log(`Attempting to remove wishlist entry ${id} for user ${userId}`);

    await Wishlist.destroy({ where: { id: id, userId: userId } });
    res.status(200).json({ success: true, message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };