import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupTestCategories() {
  console.log("🧹 Cleaning up test categories...\n");

  try {
    // Delete test categories
    const result = await prisma.category.deleteMany({
      where: {
        OR: [{ name: "test" }, { name: "Test" }],
      },
    });

    console.log(`✅ Deleted ${result.count} test categories\n`);

    // Show remaining categories
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
      },
    });

    console.log(`📊 Remaining categories: ${categories.length}\n`);

    categories.forEach((cat) => {
      console.log(`📁 ${cat.displayName} (${cat.name})`);
      console.log(`   Subcategories: ${cat.subcategories.length}`);
      cat.subcategories.forEach((sub) => {
        console.log(`      ↳ ${sub.displayName}`);
      });
      console.log();
    });

    console.log("✅ Cleanup completed!\n");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestCategories()
  .then(() => {
    console.log("🎉 Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
