import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedProductsOnly() {
  console.log("🌱 Seeding products only...\n");

  try {
    // Get existing categories and subcategories
    const ustgiyim = await prisma.category.findUnique({
      where: { name: "ustgiyim" },
    });
    const altgiyim = await prisma.category.findUnique({
      where: { name: "altgiyim" },
    });
    const elbise = await prisma.category.findUnique({
      where: { name: "elbise" },
    });
    const takim = await prisma.category.findUnique({
      where: { name: "takim" },
    });

    const ceket = await prisma.subcategory.findFirst({
      where: { name: "ceket" },
    });
    const gomlek = await prisma.subcategory.findFirst({
      where: { name: "gomlek" },
    });
    const pantolon = await prisma.subcategory.findFirst({
      where: { name: "pantolon" },
    });
    const elbiseSub = await prisma.subcategory.findFirst({
      where: { name: "elbise" },
    });
    const takimSub = await prisma.subcategory.findFirst({
      where: { name: "takim" },
    });

    if (!ustgiyim || !altgiyim || !elbise || !takim) {
      throw new Error("Categories not found! Run full seed first.");
    }

    console.log("📦 Creating products...\n");

    // Product 1
    await prisma.product.create({
      data: {
        title: "Ekru Kadın Ceket",
        productCode: "1ya1ck0015-193",
        shortDesc: "Elegant cream-colored jacket with classic tailoring",
        mainImageUrl:
          "https://via.placeholder.com/800x1000.png?text=Product",
        categoryId: ustgiyim.id,
        subcategoryId: ceket?.id,
        sizeRange: "36-42",
        price: "145$",
        status: "approved",
        images: {
          create: [
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 1,
            },
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 2,
            },
          ],
        },
      },
    });

    // Product 2
    await prisma.product.create({
      data: {
        title: "Bordo Kadın Gömlek",
        productCode: "1ya1gm0024-256",
        shortDesc: "Classic bordeaux shirt with refined tailoring",
        mainImageUrl:
          "https://via.placeholder.com/800x1000.png?text=Product",
        categoryId: ustgiyim.id,
        subcategoryId: gomlek?.id,
        sizeRange: "36-42",
        price: "78$",
        status: "approved",
        images: {
          create: [
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 1,
            },
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 2,
            },
          ],
        },
      },
    });

    // Product 3
    await prisma.product.create({
      data: {
        title: "Ekru Klasik Pantolon",
        productCode: "2165-192-26W101",
        shortDesc: "Timeless cream trousers with a modern fit",
        mainImageUrl:
          "https://via.placeholder.com/800x1000.png?text=Product",
        categoryId: altgiyim.id,
        subcategoryId: pantolon?.id,
        sizeRange: "36-42",
        price: "92$",
        status: "approved",
        images: {
          create: [
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 1,
            },
            {
              imageUrl:
                "https://via.placeholder.com/800x1000.png?text=Product",
              displayOrder: 2,
            },
          ],
        },
      },
    });

    console.log("✅ 3 products created with images!\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductsOnly()
  .then(() => {
    console.log("🎉 Products seeded successfully!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
