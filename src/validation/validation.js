const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    next();
};

const registerUserValidation = [
    body("email", "Неверный формат почты").isEmail(),
    body("password", "Пароль должен быть минимум 8 символов").isLength({ min: 8 }),
    body("name", "Укажите ваше имя").isString(),
    body("image", "Неверный путь").optional().isString(),
];

const loginUserValidation = [
    body("email", "Неверный формат электронной почты").isEmail(),
    body("password", "Пароль должен быть минимум 8 символов").isLength({ min: 8 }),
];

module.exports = {
    registerUserValidation,
    loginUserValidation,
    handleValidationErrors,
};