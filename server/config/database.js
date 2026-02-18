const mongoose = require("mongoose");
const config = require("./index");

async function connectDB() {
  try {
    await mongoose.connect(config.db.uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
