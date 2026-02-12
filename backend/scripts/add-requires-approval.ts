import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addRequiresApprovalColumn() {
  console.log("🔧 Adding requiresApproval column to admins table...\n");

  try {
    // Add column with default value true
    await prisma.$executeRaw`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS "requiresApproval" BOOLEAN NOT NULL DEFAULT true;
    `;

    console.log("✅ Column added successfully!\n");

    // Show current admins
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        requiresApproval: true,
      },
    });

    console.log("📊 Current admins:");
    admins.forEach((admin) => {
      console.log(
        `  - ${admin.email} (${admin.role}) - Requires Approval: ${admin.requiresApproval}`,
      );
    });
    console.log();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addRequiresApprovalColumn()
  .then(() => {
    console.log("🎉 Migration completed!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
