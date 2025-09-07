const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
    type: { type: String, enum: ["customer", "vendor"], required: true },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
