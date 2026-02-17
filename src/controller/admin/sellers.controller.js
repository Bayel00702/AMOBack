const prisma = require("../../prisma");

// GET /admin/sellers/pending
const getPendingSellers = async (req, res) => {
    try {
        const sellers = await prisma.user.findMany({
            where: { role: "SELLER", status: "PENDING" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                shopName: true,
                status: true,
                role: true,
                createdAt: true,
            },
        });

        return res.json({ sellers });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось получить продавцов" });
    }
};

// PATCH /admin/sellers/:id/approve
const approveSeller = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ message: "Некорректный id" });

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true, status: true },
        });

        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        if (user.role !== "SELLER") return res.status(400).json({ message: "Пользователь не продавец" });
        if (user.status !== "PENDING") return res.status(400).json({ message: "Продавец не в статусе PENDING" });

        const updated = await prisma.user.update({
            where: { id },
            data: { status: "ACTIVE" },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                shopName: true,
                updatedAt: true,
            },
        });

        return res.json({ message: "Продавец подтверждён", seller: updated });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось подтвердить продавца" });
    }
};

// PATCH /admin/sellers/:id/reject
// Решение: отклонить заявку → вернуть в BUYER, shopName очистить (чтобы не висело)
const rejectSeller = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ message: "Некорректный id" });

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true, status: true },
        });

        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        if (user.role !== "SELLER") return res.status(400).json({ message: "Пользователь не продавец" });
        if (user.status !== "PENDING") return res.status(400).json({ message: "Продавец не в статусе PENDING" });

        const updated = await prisma.user.update({
            where: { id },
            data: {
                role: "BUYER",
                status: "ACTIVE",
                shopName: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                shopName: true,
                updatedAt: true,
            },
        });

        return res.json({ message: "Заявка продавца отклонена", user: updated });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось отклонить продавца" });
    }
};

module.exports = { getPendingSellers, approveSeller, rejectSeller };