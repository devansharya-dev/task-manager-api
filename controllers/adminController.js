const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

module.exports = {
  getAllUsers,
};
