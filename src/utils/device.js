

const normalizeIp = (ip) => {
    if (!ip) return null;

    if (ip.startsWith("::ffff:")) {
        return ip.replace("::ffff:", "");
    }

    if (ip === "::1") {
        return "127.0.0.1";
    }

    return ip;
};

const getClientIp = (req) => {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        null;

    return normalizeIp(ip);
};

const getUserAgent = (req) => req.headers["user-agent"] || null;
const getDeviceName = (req) => req.headers["x-device-name"] || null;

module.exports = { getClientIp, getUserAgent, getDeviceName };