import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: no token" });
    }

    const token = header.slice("Bearer ".length).trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Под твой loginUser: jwt.sign({ id, role }, ...)
        req.user = { id: decoded.id, role: decoded.role };
        req.userId = decoded.id; // удобно для старых контроллеров

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: invalid/expired token" });
    }
};