const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    stock: { type: Number, default: 0 },
    category: String,
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
