const prisma = require("../../prisma");
const { revokeAllSessions } = require("./admin.service");
const { logAdminAction } = require("../../services/adminLog");

const banUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Некорректный id" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { status: "BANNED" },
            select: { id: true, email: true, role: true, status: true },
        });

        await revokeAllSessions(id);

        await logAdminAction({
            actorId: req.user.id,   // админ, который делает действие
            targetId: id,
            action: "USER_BAN",
            meta: { reason: req.body?.reason || null },
        });

        return res.json({ message: "Пользователь забанен, все сессии отозваны", user });
    } catch (e) {
        return res.status(500).json({ message: "Не удалось забанить пользователя" });
    }
};

const unbanUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Некорректный id" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { status: "ACTIVE" },
            select: { id: true, email: true, role: true, status: true },
        });

        await logAdminAction({
            actorId: req.user.id,
            targetId: id,
            action: "USER_UNBAN",
            meta: null,
        });

        return res.json({ message: "Пользователь разбанен", user });
    } catch (e) {
        return res.status(500).json({ message: "Не удалось разбанить пользователя" });
    }
};

const parseIntSafe = (v, def) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : def;
};

const getUsers = async (req, res) => {
    try {
        const page = parseIntSafe(req.query.page, 1);
        const limit = Math.min(parseIntSafe(req.query.limit, 20), 100);
        const skip = (page - 1) * limit;

        const role = req.query.role;     // BUYER | SELLER | ADMIN
        const status = req.query.status; // ACTIVE | PENDING | BANNED
        const q = (req.query.q || "").trim();

        const where = {};

        if (role) where.role = role;
        if (status) where.status = status;

        if (q) {
            where.OR = [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
            ];
        }

        const [total, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                    status: true,
                    shopName: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);

        return res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            users,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось получить пользователей" });
    }
};


module.exports = { banUser, unbanUser, getUsers };