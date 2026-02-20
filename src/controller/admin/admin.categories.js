const prisma = require("../../prisma");

const toSlug = (str) =>
    String(str || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, "-")
        .replace(/^-+|-+$/g, "");

const createCategory = async (req, res) => {
    try {
        const { name, slug, isActive } = req.body;

        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({ message: "name обязателен (мин. 2 символа)" });
        }

        const finalSlug = slug ? toSlug(slug) : toSlug(name);
        if (!finalSlug) return res.status(400).json({ message: "slug невалидный" });

        const category = await prisma.category.create({
            data: {
                name: String(name).trim(),
                slug: finalSlug,
                isActive: typeof isActive === "boolean" ? isActive : true,
            },
            select: { id: true, name: true, slug: true, isActive: true, createdAt: true, updatedAt: true },
        });

        return res.status(201).json({ category });
    } catch (e) {
        if (e.code === "P2002") {
            return res.status(409).json({ message: "Категория с таким name/slug уже существует" });
        }
        console.error(e);
        return res.status(500).json({ message: "Не удалось создать категорию" });
    }
};

const getCategoriesAdmin = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, slug: true, isActive: true, createdAt: true, updatedAt: true },
        });

        return res.json({ categories });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Не удалось получить категории" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ message: "Некорректный id" });

        const { name, slug, isActive } = req.body;

        const data = {};
        if (typeof name === "string" && name.trim().length >= 2) data.name = name.trim();
        if (typeof slug === "string" && slug.trim().length >= 2) data.slug = toSlug(slug);
        if (typeof isActive === "boolean") data.isActive = isActive;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: "Нечего обновлять" });
        }

        const category = await prisma.category.update({
            where: { id },
            data,
            select: { id: true, name: true, slug: true, isActive: true, createdAt: true, updatedAt: true },
        });

        return res.json({ category });
    } catch (e) {
        if (e.code === "P2025") return res.status(404).json({ message: "Категория не найдена" });
        if (e.code === "P2002") return res.status(409).json({ message: "Категория с таким name/slug уже существует" });
        console.error(e);
        return res.status(500).json({ message: "Не удалось обновить категорию" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ message: "Некорректный id" });

        await prisma.category.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        if (e.code === "P2025") return res.status(404).json({ message: "Категория не найдена" });
        console.error(e);
        return res.status(500).json({ message: "Не удалось удалить категорию" });
    }
};

module.exports = { createCategory, getCategoriesAdmin, updateCategory, deleteCategory };