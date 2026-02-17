const prisma = require("../../prisma");
const { signAccessToken } = require("../../utils/tokens");
const { hashToken, generateRefreshToken } = require("../../utils/refresh");
const { getClientIp, getUserAgent, getDeviceName } = require("../../utils/device");
const { enforceSessionLimit } = require("../../services/sessionLimit");


const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: "No refresh token" });

        const tokenHash = hashToken(token);

        const session = await prisma.session.findFirst({
            where: {
                refreshHash: tokenHash,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { user: { select: { id: true, role: true, status: true } } },
        });

        if (!session || !session.user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (session.user.status === "BANNED") {
            return res.status(403).json({ message: "Аккаунт заблокирован" });
        }

        await prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });

        const newRefresh = generateRefreshToken();
        const newHash = hashToken(newRefresh);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const ip = getClientIp(req);
        const userAgent = getUserAgent(req);
        const deviceName = getDeviceName(req);

        await prisma.session.create({
            data: {
                userId: session.user.id,
                refreshHash: newHash,
                expiresAt,
                ip,
                userAgent,
                deviceName,
            },
        });

        await enforceSessionLimit(session.user.id, 5);

        res.cookie("refreshToken", newRefresh, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: expiresAt,
            path: "/auth",
        });


        const accessToken = signAccessToken({ id: session.user.id, role: session.user.role });

        if (session.user.status === "BANNED") {
            return res.status(403).json({ message: "Аккаунт заблокирован" });
        }

        return res.json({ token: accessToken });
    } catch (e) {
        return res.status(401).json({ message: "Refresh failed" });
    }
};

module.exports = { refresh };