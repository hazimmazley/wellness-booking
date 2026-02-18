const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({
      username: username.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);

    res.json({
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          companyName: user.companyName,
        },
        token,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  res.json({ data: req.user });
};
