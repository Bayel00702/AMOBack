const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5,                  // 10 попыток за окно
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Слишком много попыток входа. Попробуйте позже." },
});

const refreshLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,  // 5 минут
    max: 30,                  // 30 запросов за окно
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Слишком много запросов refresh. Попробуйте позже." },
});

module.exports = { loginLimiter, refreshLimiter };