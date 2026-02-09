const prisma = require("../../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    try {
        const { email, password, name, phone, image, role, shopName } = req.body;

        const safeRole = role === "SELLER" ? "SELLER" : "BUYER";

        if (role === "ADMIN") {
            return res.status(403).json({ message: "Нельзя регистрировать ADMIN" });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: "Такой аккаунт уже существует" });
        }

        if (safeRole === "SELLER" && !shopName) {
            return res.status(400).json({ message: "Для продавца нужен shopName" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                phone,
                image: image || null,
                passwordHash,
                role: safeRole,

                status: safeRole === "SELLER" ? "PENDING" : "ACTIVE",

                shopName: safeRole === "SELLER" ? shopName : null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                image: true,
                role: true,
                status: true,
                shopName: true,
                createdAt: true,
            },
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        return res.json({ user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось зарегистрироваться" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userFull = await prisma.user.findUnique({ where: { email } });
        if (!userFull) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        if (userFull.status === "BANNED") {
            return res.status(403).json({ message: "Аккаунт заблокирован" });
        }

        if (userFull.role === "SELLER" && userFull.status === "PENDING") {
            return res.status(403).json({ message: "Продавец ещё не подтверждён" });
        }

        const isValid = await bcrypt.compare(password, userFull.passwordHash);
        if (!isValid) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        }

        const token = jwt.sign(
            { id: userFull.id, role: userFull.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );
        const { passwordHash, ...user } = userFull;

        return res.json({ user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось войти" });
    }
};

module.exports = { registerUser, loginUser };