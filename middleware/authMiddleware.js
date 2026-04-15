const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/jwt");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authorization token is required", 401);
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired. Please log in again", 401);
    }

    throw new AppError("Invalid authentication token", 401);
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new AppError("The user associated with this token no longer exists", 401);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
