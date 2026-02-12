import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  console.log("🔄 Removing tags and product_tags tables...\n");

  try {
    // 1. Drop product_tags table (junction table first)
    console.log("1️⃣ Dropping product_tags table...");
    try {
      await prisma.$executeRawUnsafe(`
        DROP TABLE IF EXISTS product_tags CASCADE;
      `);
      console.log("✅ product_tags table dropped\n");
    } catch (error: any) {
      console.log("ℹ️  product_tags table does not exist\n");
    }

    // 2. Drop tags table
    console.log("2️⃣ Dropping tags table...");
    try {
      await prisma.$executeRawUnsafe(`
        DROP TABLE IF EXISTS tags CASCADE;
      `);
      console.log("✅ tags table dropped\n");
    } catch (error: any) {
      console.log("ℹ️  tags table does not exist\n");
    }

    console.log("✅ Tags structure removed successfully!\n");
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
