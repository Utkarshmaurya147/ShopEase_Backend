const { Category, Product } = require("../models");
require("dotenv").config();
const { Op } = require("sequelize");

const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    
    // 1. Setup Pagination variables
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { "$category.name$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // 2. Change findAll to findAndCountAll
    const { count, rows } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Category, as: "category", attributes: ["name", "slug"] },
      ],
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']], // Newest products first
    });

    // 3. Return a structured response
    res.status(200).json({
      success: true,
      products: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching products", 
      error: error.message 
    });
  }
};

// 2. Fetch products by Category Slug (Perfect for your ShopEase routes)
const getProductsByCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const categoryWithProducts = await Category.findOne({
      where: { slug: slug },
      include: [{ model: Product, as: "products" }],
    });

    if (!categoryWithProducts) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(categoryWithProducts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching category products",
      error: error.message,
    });
  }
};

// 3. Get a single product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Create Product

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    // Check if an image was uploaded via Multer
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price || !categoryId) {
      return res
        .status(400)
        .json({ message: "Name, Price, and Category are required" });
    }

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image,
      categoryId,
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, price, stock, categoryId } = req.body;

    // If a new image is uploaded, use it. Otherwise, keep the old one.
    let image = product.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      stock: stock ? parseInt(stock) : product.stock,
      categoryId: categoryId || product.categoryId,
      image,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Note: If you want to delete the physical image file from the server,
    // you would use fs.unlink here.

    await product.destroy();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
