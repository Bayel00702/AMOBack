const router = require("express").Router();
const { authMiddleware } = require("../middleweras/AuthMiddleweras/authMiddl");

const {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem,
} = require("../cart/cart");

router.get("/", authMiddleware, getMyCart);
router.post("/", authMiddleware, addToCart);
router.patch("/:id", authMiddleware, updateCartItem);
router.delete("/:id", authMiddleware, removeCartItem);

module.exports = router;