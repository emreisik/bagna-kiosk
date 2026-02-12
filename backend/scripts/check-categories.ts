import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCategories() {
  console.log("🔍 Checking categories in database...\n");

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
      },
    });

    console.log(`📊 Total categories: ${categories.length}\n`);

    if (categories.length === 0) {
      console.log("⚠️  No categories found in database!");
      console.log("💡 Run: npm run db:seed\n");
    } else {
      categories.forEach((cat) => {
        console.log(`📁 ${cat.displayName} (${cat.name})`);
        console.log(`   ID: ${cat.id}`);
        console.log(`   Subcategories: ${cat.subcategories.length}`);
        cat.subcategories.forEach((sub) => {
          console.log(`      ↳ ${sub.displayName} (${sub.name})`);
        });
        console.log();
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories()
  .then(() => {
    console.log("✅ Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
