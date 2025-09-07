const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    password: { type: String, required: true },
    businessName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
