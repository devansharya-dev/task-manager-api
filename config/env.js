const dotenv = require("dotenv");

dotenv.config();

const getEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

module.exports = {
  getEnv,
};
