import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  console.log("🔄 Updating productCode to nullable...\n");

  try {
    // 1. Drop unique constraint
    console.log("1️⃣ Dropping unique constraint on productCode...");
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE products DROP CONSTRAINT products_productcode_key;
      `);
      console.log("✅ Unique constraint dropped\n");
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️  Constraint already removed\n");
      } else {
        throw error;
      }
    }

    // 2. Make productCode nullable
    console.log("2️⃣ Making productCode nullable...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE products ALTER COLUMN "productCode" DROP NOT NULL;
    `);
    console.log("✅ productCode is now nullable\n");

    // 3. Verify
    console.log("3️⃣ Verifying changes...");
    const productsCount = await prisma.product.count();
    console.log(`📊 Total products: ${productsCount}\n`);

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
