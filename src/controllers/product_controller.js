const { Product } = require("../models");
const validator = require("validator");

const list = async (req, res) => {
  try {
    const { q, category } = req.query;
    const businessId = req.user.id;
    const filter = { businessId };
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ name: 1 });
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error("List products error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }
    if (!price || !validator.isFloat(String(price), { min: 0 })) {
      return res.status(400).json({ success: false, message: "Price must be a non-negative number" });
    }
    if (stock && !Number.isInteger(Number(stock)) || stock < 0) {
      return res.status(400).json({ success: false, message: "Stock must be a non-negative integer" });
    }
    if (category && category.trim().length < 1) {
      return res.status(400).json({ success: false, message: "Category, if provided, must not be empty" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : undefined,
      price: Number(price),
      stock: stock ? Number(stock) : 0,
      category: category ? category.trim() : undefined,
      businessId: req.user.id,
    });

    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }
    if (price && !validator.isFloat(String(price), { min: 0 })) {
      return res.status(400).json({ success: false, message: "Price must be a non-negative number" });
    }
    if (stock && (!Number.isInteger(Number(stock)) || stock < 0)) {
      return res.status(400).json({ success: false, message: "Stock must be a non-negative integer" });
    }
    if (category && category.trim().length < 1) {
      return res.status(400).json({ success: false, message: "Category, if provided, must not be empty" });
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description && { description: description.trim() }),
      ...(price && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(category && { category: category.trim() }),
    };

    const product = await Product.findOneAndUpdate(
      { _id: id, businessId: req.user.id },
      updateData,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, businessId: req.user.id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body;

    if (!delta || !Number.isInteger(Number(delta))) {
      return res.status(400).json({ success: false, message: "Delta must be an integer" });
    }

    const product = await Product.findOne({ _id: id, businessId: req.user.id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock = Math.max(0, product.stock + Number(delta));
    await product.save();
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("Adjust stock error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  list,
  create,
  update,
  remove,
  adjustStock,
};