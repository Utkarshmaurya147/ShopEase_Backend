const {Category, Product} = require("../models");
require("dotenv").config();
const slugify = require("slugify");

// Get All Categories

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        if(!categories){
            return res.status(404).json({message: "Categories Not Found"});
        }
        return res.status(200).json({success: true, message: "All Categories", categories});
    } catch (error) {
        console.log("Error in Fetching Categories");
        return res.status(500).json({success: false, message: "Internal Server Error", error: error.message});
    }
}

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: "Category already exists or invalid data" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.destroy({ where: { id } });
    res.json({ success: true, message: "Category removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {getAllCategories, createCategory, deleteCategory};