const jwt = require("jsonwebtoken");

const signAccessToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

module.exports = { signAccessToken };