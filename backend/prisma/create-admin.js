import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function createAdmin() {
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.admin.upsert({
        where: { email: "admin@Kiosk QR.com" },
        update: {
            password: hashedPassword,
            name: "Admin User",
        },
        create: {
            email: "admin@Kiosk QR.com",
            password: hashedPassword,
            name: "Admin User",
        },
    });
    console.log("✅ Admin user created/updated:");
    console.log("   Email: admin@Kiosk QR.com");
    console.log("   Password: admin123");
    console.log("   ID:", admin.id);
}
createAdmin()
    .catch((e) => {
        console.error("❌ Failed to create admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
