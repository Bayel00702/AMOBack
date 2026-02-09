const prisma = require("../../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    try {
        const { email, password, name, image } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "email, password, name обязательны" });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: "Такой аккаунт уже существует" });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const userCreate = await prisma.user.create({
            data: {
                email,
                name,
                image: image || null,
                passwordHash: hash,
            },
            select: { id: true, email: true, name: true, image: true, createdAt: true },
        });

        const token = jwt.sign({ id: userCreate.id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        return res.json({ user: userCreate, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось зарегистрироваться" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({
                message: "Неверный email или пароль",
            });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({
                message: "Неверный email или пароль",
            });
        }
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        const { passwordHash, ...userData } = user;

        return res.json({
            user: userData,
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Не удалось войти в аккаунт",
        });
    }
};
module.exports = { registerUser, loginUser };