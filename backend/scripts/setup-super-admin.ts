import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setupSuperAdmin() {
  console.log("🔧 Setting up super admin user...\n");

  const email = "admin@Kiosk QR.com";
  const password = "admin123"; // Default password - should be changed after first login
  const name = "Super Admin";

  try {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      // Update existing admin to super_admin
      if (existingAdmin.role === "super_admin") {
        console.log(`✅ ${email} already has super_admin role\n`);
      } else {
        await prisma.admin.update({
          where: { email },
          data: { role: "super_admin" },
        });
        console.log(
          `✅ Updated ${email} role to super_admin (was: ${existingAdmin.role})\n`,
        );
      }
    } else {
      // Create new super admin
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "super_admin",
        },
      });

      console.log(`✅ Created super admin user: ${email}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`⚠️  IMPORTANT: Change this password after first login!\n`);
    }

    // Show admin details
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        brands: {
          include: {
            brand: true,
          },
        },
      },
    });

    console.log("📊 Admin Details:");
    console.log(`   ID: ${admin?.id}`);
    console.log(`   Name: ${admin?.name}`);
    console.log(`   Email: ${admin?.email}`);
    console.log(`   Role: ${admin?.role}`);
    console.log(`   Brand Assignments: ${admin?.brands.length || 0} brands\n`);

    console.log("✅ Super admin setup completed!\n");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperAdmin()
  .then(() => {
    console.log("🎉 Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
