const jwt  = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: no token" });
    }

    if (user.status === "BANNED") return res.status(403).json({ message: "Аккаунт заблокирован" });

    const token = header.slice("Bearer ".length).trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id: decoded.id, role: decoded.role };
        req.userId = decoded.id; // удобно для старых контроллеров

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: invalid/expired token" });
    }
};
 module.exports = {authMiddleware}