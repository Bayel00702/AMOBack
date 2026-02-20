const cartDTO = (cart) => {
    if (!cart) return { items: [], total: 0 };

    let total = 0;

    const items = cart.items.map((item) => {
        const price = Number(item.product.discountPrice || item.product.price);
        const subtotal = price * item.quantity;
        total += subtotal;

        return {
            id: item.id,
            quantity: item.quantity,
            product: {
                id: item.product.id,
                title: item.product.title,
                price: item.product.price,
                discountPrice: item.product.discountPrice,
                images: item.product.images,
                inStock: item.product.stock > 0,
            },
            subtotal,
        };
    });

    return { items, total };
};

module.exports = { cartDTO };