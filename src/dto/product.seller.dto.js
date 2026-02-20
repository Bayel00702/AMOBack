

const productSellerDTO = (product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stock, // ВАЖНО: продавец видит stock
    images: product.images,
    isActive: product.isActive,
    createdAt: product.createdAt,

    category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
        }
        : null,
});

const productSellerListDTO = (products = []) =>
    products.map(productSellerDTO);

module.exports = {
    productSellerDTO,
    productSellerListDTO,
};