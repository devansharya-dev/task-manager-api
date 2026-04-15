const mongoose = require("mongoose");
const { getEnv } = require("./env");

const connectDB = async () => {
  const mongoUri = getEnv("MONGO_URI");

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDB;
