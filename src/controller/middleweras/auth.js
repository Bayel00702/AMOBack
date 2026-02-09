const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");

const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ message: "Нет токена" });

        const token = header.replace("Bearer ", "").trim();
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, role: true, status: true },
        });

        if (!user) return res.status(401).json({ message: "Пользователь не найден" });

        req.user = user; // {id, role, status}
        next();
    } catch (e) {
        return res.status(401).json({ message: "Неверный токен" });
    }
};

module.exports = auth;