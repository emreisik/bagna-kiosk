import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMigration() {
  console.log("🔄 Starting database migration...\n");

  try {
    // 1. Check if columns exist
    console.log("1️⃣ Checking existing schema...");

    // 2. Add slug column to brands (if not exists)
    console.log("2️⃣ Adding slug column to brands table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE brands
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
    `);
    console.log("✅ Slug column added (or already exists)\n");

    // 3. Add status column to products (if not exists)
    console.log("3️⃣ Adding status column to products table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
    `);
    console.log("✅ Status column added (or already exists)\n");

    // 4. Create indexes
    console.log("4️⃣ Creating indexes...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
    `);
    console.log("✅ Indexes created\n");

    // 5. Generate slugs for existing brands
    console.log("5️⃣ Generating slugs for existing brands...");
    await prisma.$executeRawUnsafe(`
      UPDATE brands
      SET slug = LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9 ]', '', 'g'),
          ' +', '-', 'g'
        )
      )
      WHERE slug IS NULL;
    `);
    console.log("✅ Slugs generated\n");

    // 6. Add unique constraint to slug
    console.log("6️⃣ Adding unique constraint to slug...");
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE brands
        ADD CONSTRAINT brands_slug_unique UNIQUE (slug);
      `);
      console.log("✅ Unique constraint added\n");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️  Unique constraint already exists\n");
      } else {
        throw error;
      }
    }

    // 7. Approve all existing products
    console.log("7️⃣ Approving all existing products...");
    const result = await prisma.$executeRawUnsafe(`
      UPDATE products
      SET status = 'approved'
      WHERE status IS NULL OR status = 'pending';
    `);
    console.log(`✅ Products approved\n`);

    // 8. Verify changes
    console.log("8️⃣ Verifying migration...");
    const brandsCount = await prisma.brand.count();
    const approvedProducts = await prisma.product.count({
      where: { status: "approved" },
    });

    console.log("\n✅ Migration completed successfully!");
    console.log(`📊 Total brands: ${brandsCount}`);
    console.log(`📊 Approved products: ${approvedProducts}\n`);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .then(() => {
    console.log("🎉 All done! You can now restart the backend server.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
