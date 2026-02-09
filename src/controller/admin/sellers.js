const prisma = require("../../prisma");

const approveSeller = async (req, res) => {
    try {
        const sellerId = Number(req.params.id);
        if (!sellerId) return res.status(400).json({ message: "Неверный id" });

        const seller = await prisma.user.findUnique({ where: { id: sellerId } });
        if (!seller) return res.status(404).json({ message: "Продавец не найден" });

        if (seller.role !== "SELLER") {
            return res.status(400).json({ message: "Это не продавец" });
        }

        if (seller.status === "ACTIVE") {
            return res.json({ message: "Уже подтвержден", sellerId });
        }

        const updated = await prisma.user.update({
            where: { id: sellerId },
            data: { status: "ACTIVE" },
            select: { id: true, email: true, role: true, status: true, shopName: true },
        });

        return res.json({ message: "Продавец подтвержден", seller: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось подтвердить продавца" });
    }
};

const listPendingSellers = async (req, res) => {
    try {
        const sellers = await prisma.user.findMany({
            where: { role: "SELLER", status: "PENDING" },
            select: { id: true, email: true, name: true, phone: true, shopName: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        return res.json(sellers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось получить список" });
    }
};

module.exports = { approveSeller, listPendingSellers };