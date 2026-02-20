const prisma = require("../../prisma");
const { getOrCreateCart } = require("../../services/cart.services");
const { cartDTO } = require("../../dto/cart.dto");


// GET MY CART
const getMyCart = async (req, res) => {
    const user = req.user;

    const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
            items: {
                include: { product: true },
            },
        },
    });

    res.json(cartDTO(cart));
};


// ADD TO CART
const addToCart = async (req, res) => {
    const user = req.user;
    const { productId, quantity = 1 } = req.body;

    const cart = await getOrCreateCart(user.id);

    const existing = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId,
            },
        },
    });

    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    }

    res.json({ message: "Добавлено в корзину" });
};


// UPDATE QTY
const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    await prisma.cartItem.update({
        where: { id },
        data: { quantity },
    });

    res.json({ message: "Количество обновлено" });
};


// REMOVE ITEM
const removeCartItem = async (req, res) => {
    const { id } = req.params;

    await prisma.cartItem.delete({
        where: { id },
    });

    res.json({ message: "Удалено из корзины" });
};


module.exports = {
    getMyCart,
    addToCart,
    updateCartItem,
    removeCartItem,
};