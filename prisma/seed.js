const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding...");

    // =====================
    // ADMIN
    // =====================
    const adminPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.create({
        data: {
            email: "admin@test.com",
            name: "Admin",
            phone: "+996700000001",
            passwordHash: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });

    // =====================
    // SELLER
    // =====================
    const sellerPassword = await bcrypt.hash("seller123", 10);

    const seller = await prisma.user.create({
        data: {
            email: "seller@test.com",
            name: "Seller",
            phone: "+996700000002",
            passwordHash: sellerPassword,
            role: "SELLER",
            status: "ACTIVE",
            shopName: "Tech Store",
        },
    });

    // =====================
    // CATEGORIES
    // =====================
    const electronics = await prisma.category.create({
        data: {
            name: "Электроника",
            slug: "electronics",
        },
    });

    const clothes = await prisma.category.create({
        data: {
            name: "Одежда",
            slug: "clothes",
        },
    });

    // =====================
    // PRODUCTS
    // =====================
    await prisma.product.createMany({
        data: [
            {
                title: "iPhone 13",
                description: "128GB, Black",
                price: "50000.00",
                discountPrice: "47000.00",
                stock: 5,
                images: ["https://dummyimage.com/iphone.jpg"],
                categoryId: electronics.id,
                sellerId: seller.id,
            },
            {
                title: "Nike Air Max",
                description: "Оригинал",
                price: "12000.00",
                stock: 10,
                images: ["https://dummyimage.com/nike.jpg"],
                categoryId: clothes.id,
                sellerId: seller.id,
            },
        ],
    });

    console.log("✅ Seed completed");
    console.log("Admin:", admin.email, "password: admin123");
    console.log("Seller:", seller.email, "password: seller123");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });