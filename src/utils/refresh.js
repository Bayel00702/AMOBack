const crypto = require("crypto");

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

module.exports = { generateRefreshToken, hashToken };