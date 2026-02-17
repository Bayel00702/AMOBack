const prisma = require("../../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateRefreshToken, hashToken} = require("../../utils/refresh");
const { signAccessToken } = require("../../utils/tokens");
const { getClientIp, getUserAgent, getDeviceName } = require("../../utils/device");
const { enforceSessionLimit } = require("../../services/sessionLimit");




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
        if (!userFull) return res.status(400).json({ message: "Неверный email или пароль" });

        if (userFull.status === "BANNED") {
            return res.status(403).json({ message: "Аккаунт заблокирован" });
        }

        if (userFull.role === "SELLER" && userFull.status === "PENDING") {
            return res.status(403).json({ message: "Продавец ещё не подтверждён" });
        }

        const isValid = await bcrypt.compare(password, userFull.passwordHash);
        if (!isValid) return res.status(400).json({ message: "Неверный email или пароль" });

        const accessToken = signAccessToken({ id: userFull.id, role: userFull.role });

        const refreshToken = generateRefreshToken();
        const refreshHash = hashToken(refreshToken);

        const refreshDays = userFull.role === "ADMIN" ? 7 : 30;
        const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

        const ip = getClientIp(req);
        const userAgent = getUserAgent(req);
        const deviceName = getDeviceName(req);

        await prisma.session.create({
            data: {
                userId: userFull.id,
                refreshHash,
                expiresAt,
                ip,
                userAgent,
                deviceName,
            },
        });

        await enforceSessionLimit(userFull.id, 5);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: expiresAt,
            path: "/auth",
        });

        const { passwordHash, ...user } = userFull;
        return res.json({ user, token: accessToken });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Не удалось войти" });
    }
};

const logOut = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        const tokenHash = hashToken(token);
        await prisma.session.updateMany({
            where: { refreshHash: tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    res.clearCookie("refreshToken", { path: "/auth" });
    res.json({ ok: true });
};

const logoutAll = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        res.clearCookie("refreshToken", { path: "/auth" });

        return res.json({ ok: true, message: "Вы вышли со всех устройств" });
    } catch (e) {
        return res.status(500).json({ message: "Не удалось выйти со всех устройств" });
    }
};


module.exports = { registerUser, loginUser, logOut, logoutAll };