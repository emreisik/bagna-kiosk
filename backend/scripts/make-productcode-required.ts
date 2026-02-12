import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  console.log("🔄 Making productCode required...\n");

  try {
    // 1. Check for NULL productCodes
    console.log("1️⃣ Checking for products with NULL productCode...");
    const productsWithNullCode = await prisma.$queryRaw<
      Array<{ id: string; title: string }>
    >`
      SELECT id, title FROM products WHERE "productCode" IS NULL;
    `;

    if (productsWithNullCode.length > 0) {
      console.log(
        `⚠️  Found ${productsWithNullCode.length} products with NULL productCode:`,
      );
      productsWithNullCode.forEach((p) => {
        console.log(`   - ${p.id}: ${p.title}`);
      });

      // Generate productCode for products without one
      console.log("\n2️⃣ Generating productCode for products without one...");
      for (const product of productsWithNullCode) {
        const generatedCode = `AUTO-${product.id.slice(-8).toUpperCase()}`;
        await prisma.$executeRawUnsafe(
          `UPDATE products SET "productCode" = $1 WHERE id = $2;`,
          generatedCode,
          product.id,
        );
        console.log(
          `   ✅ Updated ${product.id} with productCode: ${generatedCode}`,
        );
      }
    } else {
      console.log("✅ All products have productCode\n");
    }

    // 3. Make productCode NOT NULL
    console.log("3️⃣ Making productCode NOT NULL...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE products ALTER COLUMN "productCode" SET NOT NULL;
    `);
    console.log("✅ productCode is now required\n");

    // 4. Verify
    console.log("4️⃣ Verifying changes...");
    const productsCount = await prisma.product.count();
    const productsWithCode = await prisma.product.count({
      where: {
        productCode: {
          not: null,
        },
      },
    });
    console.log(`📊 Total products: ${productsCount}`);
    console.log(`📊 Products with productCode: ${productsWithCode}\n`);

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .then(() => {
    console.log("🎉 Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
