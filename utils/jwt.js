const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

const signToken = (payload) =>
  jwt.sign(payload, getEnv("JWT_SECRET"), {
    expiresIn: getEnv("JWT_EXPIRES_IN"),
  });

const verifyToken = (token) => jwt.verify(token, getEnv("JWT_SECRET"));

module.exports = {
  signToken,
  verifyToken,
};
