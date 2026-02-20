const { body } = require("express-validator");

const createProductValidation = [
    body("title")
        .isString().withMessage("Название должен быть строкой")
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage("Название 3-120 символов"),

    body("description")
        .optional()
        .isString().withMessage("Описание должен быть строкой")
        .isLength({ max: 5000 }).withMessage("Описание максимум 5000 символов"),

    body("price")
        .notEmpty().withMessage("Цена обязателен")
        .isDecimal({ decimal_digits: "0,2" }).withMessage("Цена должен быть числом (до 2 знаков после запятой)")
        .custom((value) => Number(value) > 0).withMessage("Цена должен быть > 0"),

    body("discountPrice")
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: "0,2" }).withMessage("discountPrice должен быть числом (до 2 знаков)")
        .custom((value, { req }) => {
            if (value === null || value === undefined || value === "") return true;
            const dp = Number(value);
            const p = Number(req.body.price);
            if (dp <= 0) throw new Error("discountPrice должен быть > 0");
            if (!Number.isNaN(p) && dp >= p) throw new Error("discountPrice должен быть меньше price");
            return true;
        }),

    body("stock")
        .optional()
        .isInt({ min: 0, max: 1000000 }).withMessage("stock должен быть целым числом >= 0"),

    body("images")
        .optional()
        .isArray({ min: 1, max: 10 }).withMessage("images должен быть массивом (1-10 элементов)"),

    body("images.*")
        .optional()
        .isString().withMessage("каждая картинка должна быть строкой")
        .isLength({ min: 5, max: 2048 }).withMessage("ссылка на картинку слишком короткая/длинная"),

    body("categoryId")
        .notEmpty().withMessage("categoryId обязателен")
        .isInt({ min: 1 }).withMessage("categoryId должен быть числом"),
];

const updateProductValidation = [
    body("Название")
        .optional()
        .isString().withMessage("Название должен быть строкой")
        .trim()
        .isLength({ min: 3, max: 120 }).withMessage("Название 3-120 символов"),

    body("Описание")
        .optional({ nullable: true })
        .isString().withMessage("Описание должен быть строкой")
        .isLength({ max: 5000 }).withMessage("Описание максимум 5000 символов"),

    body("Цена")
        .optional()
        .isDecimal({ decimal_digits: "0,2" }).withMessage("Цена должен быть числом (до 2 знаков)")
        .custom((value) => Number(value) > 0).withMessage("Цена должен быть > 0"),

    body("discountPrice")
        .optional({ nullable: true })
        .isDecimal({ decimal_digits: "0,2" }).withMessage("discountPrice должен быть числом (до 2 знаков)")
        .custom((value, { req }) => {
            if (value === null || value === undefined || value === "") return true;
            const dp = Number(value);
            const p = req.body.price !== undefined ? Number(req.body.price) : undefined;
            if (dp <= 0) throw new Error("discountPrice должен быть > 0");
            if (p !== undefined && !Number.isNaN(p) && dp >= p) throw new Error("discountPrice должен быть меньше price");
            return true;
        }),

    body("stock")
        .optional()
        .isInt({ min: 0, max: 1000000 }).withMessage("stock должен быть целым числом >= 0"),

    body("images")
        .optional()
        .isArray({ min: 1, max: 10 }).withMessage("images должен быть массивом (1-10 элементов)"),

    body("images.*")
        .optional()
        .isString().withMessage("каждая картинка должна быть строкой")
        .isLength({ min: 5, max: 2048 }).withMessage("ссылка на картинку слишком короткая/длинная"),

    body("categoryId")
        .optional()
        .isInt({ min: 1 }).withMessage("categoryId должен быть числом"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive должен быть boolean"),
];

module.exports = {
    createProductValidation,
    updateProductValidation,
};