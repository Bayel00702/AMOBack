const express = require("express");
const router = express.Router();

const {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    getMyProducts
} = require("../product/product");
const { authMiddleware } = require("../middleweras/AuthMiddleweras/authMiddl");
const { handleValidationErrors } = require("../middleweras/handleValidationErrors/handleValidationErrors");
const {
    createProductValidation,
    updateProductValidation,
} = require("../../validation/productValidation");
const {
    getPendingProducts,
    approveProduct,
    rejectProduct,
} = require("../admin/productModeration");

// public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// protected
router.post(
    "/",
    authMiddleware,
    createProductValidation,
    handleValidationErrors,
    createProduct
);

router.get("/my", authMiddleware, getMyProducts);


router.get("/products/pending", authMiddleware, getPendingProducts);
router.patch("/products/:id/approve", authMiddleware, approveProduct);
router.patch("/products/:id/reject", authMiddleware, rejectProduct);

router.patch(
    "/:id",
    authMiddleware,
    updateProductValidation,
    handleValidationErrors,
    updateProduct
);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;