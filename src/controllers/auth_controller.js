const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const validator = require("validator"); // For email validation


const validateRegisterInput = ({ name, email, username, password, businessName }) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  if (!email || !validator.isEmail(email)) {
    errors.push("Valid email is required");
  }
  if (!username || username.trim().length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!businessName || businessName.trim().length < 2) {
    errors.push("Business name must be at least 2 characters long");
  }

  return errors;
};

const register = async (req, res) => {
  try {
    const { name, email, username, password, businessName } = req.body;

    const validationErrors = validateRegisterInput({ name, email, username, password, businessName });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      businessName: businessName.trim(),
    });

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name, username: user.username },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: "Email/username and password are required" });
    }

    const normalizedInput = emailOrUsername.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedInput }, { username: normalizedInput }],
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name, username: user.username },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  // logout is handled client-side by removing the token
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove the JWT token from the client.",
  });
};

module.exports = {
  register,
  login,
  logout,
};