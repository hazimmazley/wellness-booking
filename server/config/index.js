require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || "development",
  db: {
    uri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/wellness-booking",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
};

module.exports = config;
