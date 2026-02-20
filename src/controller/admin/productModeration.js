const prisma = require("../../prisma");

const getPendingProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { status: "PENDING" },
            include: {
                category: true,
                seller: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(products);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка получения товаров" });
    }
};

const approveProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: { status: "APPROVED" },
        });

        await prisma.productModerationLog.create({
            data: {
                productId: product.id,
                adminId: req.user.id,
                action: "APPROVED",
            },
        });

        res.json(product);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка подтверждения товара" });
    }
};

const rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                status: "REJECTED",
                rejectReason: reason || "Без указания причины",
                isActive: false,
            },
        });

        await prisma.productModerationLog.create({
            data: {
                productId: product.id,
                adminId: req.user.id,
                action: "REJECTED",
                reason,
            },
        });

        res.json(product);
    } catch (e) {
        res.status(500).json({ message: "Ошибка отклонения товара" });
    }
};

const resubmitProduct = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product || product.sellerId !== user.id) {
            return res.status(403).json({ message: "Нет доступа" });
        }

        const updated = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                status: "PENDING",
                rejectReason: null,
            },
        });

        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: "Ошибка повторной отправки" });
    }
};

module.exports = {
    getPendingProducts,
    approveProduct,
    rejectProduct,
};