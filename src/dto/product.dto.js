

const productPublicDTO = (product) => {
    if (!product) return null;

    return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images,
        createdAt: product.createdAt,

        category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
            }
            : null,

        seller: product.seller
            ? {
                id: product.seller.id,
                name: product.seller.name,
                shopName: product.seller.shopName,
            }
            : null,

        inStock: product.stock > 0,
    };
};

// Список товаров
const productListDTO = (products = []) => {
    return products.map(productPublicDTO);
};

module.exports = {
    productPublicDTO,
    productListDTO,
};