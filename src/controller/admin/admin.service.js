const prisma = require("../../prisma");

const revokeAllSessions = async (userId) => {
    await prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};

module.exports = { revokeAllSessions };