const prisma = require("../prisma");

const enforceSessionLimit = async (userId, maxActive = 5) => {
    const active = await prisma.session.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" }, // новые сверху
        select: { id: true },
    });

    if (active.length <= maxActive) return;

    const toRevoke = active.slice(maxActive).map((s) => s.id);

    await prisma.session.updateMany({
        where: { id: { in: toRevoke } },
        data: { revokedAt: new Date() },
    });
};

module.exports = { enforceSessionLimit };