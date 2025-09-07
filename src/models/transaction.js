const mongoose = require("mongoose");

const LineItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  price: Number,
});

const TransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["sale", "purchase"], required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    products: [LineItemSchema],
    totalAmount: Number,
    date: { type: Date, default: Date.now },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
