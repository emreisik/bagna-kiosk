import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetProducts() {
  console.log("🗑️  Resetting products...\n");

  try {
    // Delete all products (cascade will handle images)
    const result = await prisma.product.deleteMany({});
    console.log(`✅ Deleted ${result.count} products\n`);

    console.log("✅ Products reset completed!\n");
    console.log("💡 Now run: npm run db:seed\n");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetProducts()
  .then(() => {
    console.log("🎉 Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
