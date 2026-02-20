const prisma = require("../../prisma");
const { productPublicDTO, productListDTO } = require("../../dto/product.dto");
const { productSellerListDTO } = require("../../dto/product.seller.dto");
const { runModeration } = require("../../moderation/moderationEngine");

const createProduct = async (req, res) => {
    try {
        const user = req.user; // из middleware auth

        if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
            return res.status(403).json({ message: "Нет доступа" });
        }

        const {
            title,
            description,
            price,
            discountPrice,
            stock,
            images,
            categoryId,
        } = req.body;

        const moderation = runModeration({
            title,
            description,
            price,
            images,
        });

        const product = await prisma.product.create({
            data: {
                title,
                description,
                price,
                images,
                categoryId,
                sellerId: user.id,
                status: moderation.status,
                rejectReason:
                    moderation.status === "REJECTED" ? moderation.reason : null,
            },
        });

        res.json(product);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка создания товара" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        if (user.role !== "ADMIN" && product.sellerId !== user.id) {
            return res.status(403).json({ message: "Нет доступа" });
        }

        const {
            title,
            description,
            price,
            discountPrice,
            stock,
            images,
            categoryId,
            isActive,
        } = req.body;

        const updated = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(price && { price: price.toString() }),
                ...(discountPrice !== undefined && {
                    discountPrice: discountPrice ? discountPrice.toString() : null,
                }),
                ...(stock !== undefined && { stock }),
                ...(images && { images }),
                ...(categoryId && { categoryId }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка обновления товара" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                seller: true,
            },
        });

        if (!product || !product.isActive) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        if (!product || product.status !== "APPROVED") {
            return res.status(404).json({ message: "Товар не найден" });
        }
        res.json(productPublicDTO(product));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка получения товара" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const {
            categoryId,
            sellerId,
            minPrice,
            maxPrice,
            q,
            inStock,
            sort = "createdAt_desc",
            page = 1,
            limit = 12,
        } = req.query;

        const pageNum = Math.max(Number(page) || 1, 1);
        const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 50);
        const skip = (pageNum - 1) * limitNum;

        // сортировка
        const sortMap = {
            createdAt_desc: { createdAt: "desc" },
            createdAt_asc: { createdAt: "asc" },
            price_asc: { price: "asc" },
            price_desc: { price: "desc" },
        };
        const orderBy = sortMap[sort] || sortMap.createdAt_desc;

        // фильтры
        const where = {
            isActive: true,
            status: "APPROVED",

            ...(categoryId ? { categoryId: Number(categoryId) } : {}),
            ...(sellerId ? { sellerId: Number(sellerId) } : {}),

            ...(q
                ? {
                    title: {
                        contains: String(q),
                        mode: "insensitive",
                    },
                }
                : {}),

            ...((minPrice || maxPrice)
                ? {
                    price: {
                        ...(minPrice ? { gte: minPrice } : {}),
                        ...(maxPrice ? { lte: maxPrice } : {}),
                    },
                }
                : {}),

            ...(String(inStock) === "true" ? { stock: { gt: 0 } } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    seller: { select: { id: true, name: true, shopName: true } },
                },
            }),
            prisma.product.count({ where }),
        ]);

        // DTO: скрываем stock (и можно скрыть sellerId, categoryId если хочешь)
        const data = productListDTO(items);

        res.json({
            data,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });

        res.json({
            data,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });


    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка получения товаров" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        if (user.role !== "ADMIN" && product.sellerId !== user.id) {
            return res.status(403).json({ message: "Нет доступа" });
        }

        await prisma.product.update({
            where: { id: Number(id) },
            data: { isActive: false },
        });

        res.json({ message: "Товар удален" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка удаления товара" });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const user = req.user;

        if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
            return res.status(403).json({ message: "Нет доступа" });
        }

        const { page = 1, limit = 10 } = req.query;

        const pageNum = Math.max(Number(page) || 1, 1);
        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const skip = (pageNum - 1) * limitNum;

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where: { sellerId: user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
                include: {
                    category: true,
                },
            }),
            prisma.product.count({
                where: { sellerId: user.id },
            }),
        ]);

        res.json({
            data: productSellerListDTO(items),
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Ошибка получения моих товаров" });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    getMyProducts
};