import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkProductImages() {
  console.log("🔍 Checking product images...\n");

  try {
    const products = await prisma.product.findMany({
      take: 3,
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    console.log(`📊 Found ${products.length} products\n`);

    products.forEach((product) => {
      console.log(`📦 ${product.title}`);
      console.log(`   Product Code: ${product.productCode}`);
      console.log(`   Main Image: ${product.mainImageUrl}`);
      console.log(`   Gallery Images: ${product.images.length}`);
      product.images.forEach((img, idx) => {
        console.log(
          `      ${idx + 1}. ${img.imageUrl.substring(0, 60)}... (order: ${img.displayOrder})`,
        );
      });
      console.log();
    });

    console.log("✅ Done!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkProductImages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
