import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeNagradaUrls() {
  console.log("🔧 Removing nagrada.com.tr URLs from database...\n");

  try {
    // Update products mainImageUrl
    const productsUpdated = await prisma.product.updateMany({
      where: {
        mainImageUrl: {
          contains: "nagrada.com.tr",
        },
      },
      data: {
        mainImageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
      },
    });
    console.log(`✅ Updated ${productsUpdated.count} product main images\n`);

    // Get all product images with nagrada URLs
    const imagesToUpdate = await prisma.productImage.findMany({
      where: {
        imageUrl: {
          contains: "nagrada.com.tr",
        },
      },
    });

    console.log(`📊 Found ${imagesToUpdate.length} product images to update\n`);

    // Update each image
    for (const img of imagesToUpdate) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: {
          imageUrl: `https://via.placeholder.com/800x1000.png?text=Gallery+${img.displayOrder + 1}`,
        },
      });
    }

    console.log(`✅ Updated ${imagesToUpdate.length} product gallery images\n`);

    console.log("✅ All nagrada.com.tr URLs removed!\n");
  } catch (error) {
    console.error("❌ Failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeNagradaUrls()
  .then(() => {
    console.log("🎉 Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
