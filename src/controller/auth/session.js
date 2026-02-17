const prisma = require("../../prisma");
const { hashToken } = require("../../utils/refresh");

const listMySessions = async (req, res) => {
    const userId = req.user.id;

    const sessions = await prisma.session.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            ip: true,
            userAgent: true,
            deviceName: true,
        },
    });

    res.json({ sessions });
};

const revokeSession = async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.params.id;

    await prisma.session.updateMany({
        where: { id: sessionId, userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });

    res.json({ ok: true });
};

const revokeAllSessions = async (req, res) => {
    const userId = req.user.id;

    await prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });

    res.clearCookie("refreshToken", { path: "/auth" });
    res.json({ ok: true });
};

module.exports = { listMySessions, revokeSession, revokeAllSessions };