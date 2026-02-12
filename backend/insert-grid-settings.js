import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertGridSettings() {
  await prisma.settings.upsert({
    where: { key: "grid_columns_mobile" },
    update: { value: "2" },
    create: { key: "grid_columns_mobile", value: "2" },
  });

  await prisma.settings.upsert({
    where: { key: "grid_columns_tablet" },
    update: { value: "2" },
    create: { key: "grid_columns_tablet", value: "2" },
  });

  await prisma.settings.upsert({
    where: { key: "grid_columns_desktop" },
    update: { value: "3" },
    create: { key: "grid_columns_desktop", value: "3" },
  });

  await prisma.settings.upsert({
    where: { key: "grid_columns_kiosk" },
    update: { value: "4" },
    create: { key: "grid_columns_kiosk", value: "4" },
  });

  console.log("✅ Grid columns settings inserted:");
  console.log("  - Mobile: 2 columns");
  console.log("  - Tablet: 2 columns");
  console.log("  - Desktop: 3 columns");
  console.log("  - Kiosk: 4 columns");

  await prisma.$disconnect();
}

insertGridSettings().catch(console.error);
