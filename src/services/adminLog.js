const prisma = require("../prisma");

const logAdminAction = async ({ actorId, targetId = null, action, meta = null }) => {
    return prisma.adminActionLog.create({
        data: { actorId, targetId, action, meta },
    });
};

module.exports = { logAdminAction };