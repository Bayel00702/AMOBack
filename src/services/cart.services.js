const prisma = require("../prisma");

const getOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
        });
    }

    return cart;
};

module.exports = { getOrCreateCart };