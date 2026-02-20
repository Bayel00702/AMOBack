const prisma = require("../../prisma");

const getCategoriesPublic = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true, slug: true },
        });

        return res.json({ categories });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось получить категории" });
    }
};

module.exports = { getCategoriesPublic };