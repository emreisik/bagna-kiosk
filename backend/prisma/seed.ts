import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Categories
  console.log("📁 Creating categories...");
  const ustgiyim = await prisma.category.create({
    data: { name: "ustgiyim", displayName: "Üst Giyim" },
  });
  const altgiyim = await prisma.category.create({
    data: { name: "altgiyim", displayName: "Alt Giyim" },
  });
  const elbise = await prisma.category.create({
    data: { name: "elbise", displayName: "Elbise & Tulum" },
  });
  const takim = await prisma.category.create({
    data: { name: "takim", displayName: "Takım" },
  });
  console.log("✅ Categories created");

  // Create Subcategories
  console.log("📂 Creating subcategories...");
  const ceket = await prisma.subcategory.create({
    data: {
      name: "ceket",
      displayName: "Ceket & Yelek",
      categoryId: ustgiyim.id,
    },
  });
  const gomlek = await prisma.subcategory.create({
    data: {
      name: "gomlek",
      displayName: "Gömlek",
      categoryId: ustgiyim.id,
    },
  });
  const pantolon = await prisma.subcategory.create({
    data: {
      name: "pantolon",
      displayName: "Pantolon",
      categoryId: altgiyim.id,
    },
  });
  const elbiseSub = await prisma.subcategory.create({
    data: {
      name: "elbise",
      displayName: "Elbise",
      categoryId: elbise.id,
    },
  });
  const takimSub = await prisma.subcategory.create({
    data: {
      name: "takim",
      displayName: "Takım",
      categoryId: takim.id,
    },
  });
  console.log("✅ Subcategories created");

  // Create Products
  console.log("📦 Creating products...");

  // Product 1: Ekru Blazer
  await prisma.product.create({
    data: {
      title: "Ekru Tek Düğmeli Cepli Kadın Blazer Ceket",
      productCode: "1ya1ck0015-193",
      shortDesc: "Premium single-button blazer with pocket details in ecru",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: ceket.id,
      sizeRange: "36-42",
      price: "145$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 3,
          },
        ],
      },
    },
  });

  // Product 2: Bordo Gömlek
  await prisma.product.create({
    data: {
      title: "Bordo Kadın Gömlek",
      productCode: "1ya1gm0024-256",
      shortDesc: "Classic bordeaux shirt with refined tailoring",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: gomlek.id,
      sizeRange: "36-42",
      price: "78$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 3: Ekru Pantolon
  await prisma.product.create({
    data: {
      title: "Ekru Klasik Pantolon",
      productCode: "2165-192-26W101",
      shortDesc: "Classic tailored pants in ecru with refined fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 4: Bej Elbise
  await prisma.product.create({
    data: {
      title: "Bej Bisiklet Yaka Mini Elbise",
      productCode: "BGNELB-001",
      shortDesc: "Beige crew neck mini dress with elegant silhouette",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: elbise.id,
      subcategoryId: elbiseSub.id,
      sizeRange: "36-42",
      price: "120$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 5: Kahverengi Takım
  await prisma.product.create({
    data: {
      title: "Kahverengi Pantolonlu Takım",
      productCode: "1ya1ta0007-207",
      shortDesc: "Elegant brown suit with tailored pants",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: takim.id,
      subcategoryId: takimSub.id,
      sizeRange: "36-42",
      price: "185$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 3,
          },
        ],
      },
    },
  });

  // Product 6: Siyah Gömlek
  await prisma.product.create({
    data: {
      title: "Siyah Kadın Gömlek",
      productCode: "1ya1gm0006-228",
      shortDesc: "Classic black shirt with refined tailoring",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: gomlek.id,
      sizeRange: "36-42",
      price: "82$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 7: Koyu Yeşil Pantolon
  await prisma.product.create({
    data: {
      title: "Koyu Yeşil Klasik Pantolon",
      productCode: "4175-272-26W109",
      shortDesc: "Tailored pants in deep green with refined fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 8: Yeşil Pantolon
  await prisma.product.create({
    data: {
      title: "Yeşil Klasik Pantolon",
      productCode: "4188-272-26W101",
      shortDesc: "Classic tailored pants in green with elegant fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 9: Ekru Pantolon #2
  await prisma.product.create({
    data: {
      title: "Ekru Klasik Pantolon",
      productCode: "2146-192-26W101",
      shortDesc: "Classic tailored pants in ecru with refined details",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  console.log("✅ All 9 products created with images");

  // Create default admin user
  console.log("👤 Creating default admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.create({
    data: {
      email: "admin@Kiosk QR.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });
  console.log(
    "✅ Admin user created (email: admin@Kiosk QR.com, password: admin123)",
  );

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
