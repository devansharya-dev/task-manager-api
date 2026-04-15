const bcrypt = require("bcrypt");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/jwt");
const { validateRegisterInput, validateLoginInput } = require("../utils/validators");
const sanitizeUser = require("../utils/sanitizeUser");

const register = asyncHandler(async (req, res) => {
  validateRegisterInput(req.body);

  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = signToken({ id: user._id, role: user.role });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  validateLoginInput(req.body);

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

module.exports = {
  register,
  login,
};
