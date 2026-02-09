const prisma = require("../../prisma");

const getAllUser = async (req, res) => {
    try {
        const { status } = req.query;

        const users = await prisma.user.findMany({
            where: status ? { status } : undefined,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
            },
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Не удалось получить пользователей",
        });
    }
};

module.exports = { getAllUser };