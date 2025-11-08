const Category = require("../models/category");
const Service = require("../models/service");

async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Category name required" });

    const existing = await Category.findOne({ name: name.trim() });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const cat = await Category.create({ name: name.trim() });
    return res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listCategories(req, res) {
  try {
    const categories = await Category.find().lean();
    const categoriesWithServices = await Promise.all(
      categories.map(async (c) => {
        const services = await Service.find({ category: c._id })
          .select("_id name type")
          .lean();
        return { ...c, services };
      })
    );
    return res.json(categoriesWithServices);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category Name is required.",
      });
    }
    const cat = await Category.findById(categoryId);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    if (name) cat.name = name;
    await cat.save();
    return res.json(cat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const cat = await Category.findById(categoryId);
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const count = await Service.countDocuments({ category: categoryId });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with associated services.",
      });
    }

    await Category.deleteOne({ _id: categoryId });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (err) {
    console.error("Delete Category Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
}

module.exports = {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
