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

  // Seed color translations
  console.log("🎨 Seeding color translations...");
  const colorTranslations: Record<string, Record<string, string>> = {
    // Temel renkler
    siyah: { tr: "Siyah", en: "Black", ru: "Чёрный" },
    beyaz: { tr: "Beyaz", en: "White", ru: "Белый" },
    kirmizi: { tr: "Kırmızı", en: "Red", ru: "Красный" },
    mavi: { tr: "Mavi", en: "Blue", ru: "Синий" },
    yesil: { tr: "Yeşil", en: "Green", ru: "Зелёный" },
    sari: { tr: "Sarı", en: "Yellow", ru: "Жёлтый" },
    turuncu: { tr: "Turuncu", en: "Orange", ru: "Оранжевый" },
    mor: { tr: "Mor", en: "Purple", ru: "Фиолетовый" },
    pembe: { tr: "Pembe", en: "Pink", ru: "Розовый" },
    gri: { tr: "Gri", en: "Gray", ru: "Серый" },
    kahverengi: { tr: "Kahverengi", en: "Brown", ru: "Коричневый" },
    bej: { tr: "Bej", en: "Beige", ru: "Бежевый" },
    lacivert: { tr: "Lacivert", en: "Navy", ru: "Тёмно-синий" },
    bordo: { tr: "Bordo", en: "Burgundy", ru: "Бордовый" },
    ekru: { tr: "Ekru", en: "Ecru", ru: "Экрю" },
    krem: { tr: "Krem", en: "Cream", ru: "Кремовый" },
    // Tonlar
    "koyu yesil": { tr: "Koyu Yeşil", en: "Dark Green", ru: "Тёмно-зелёный" },
    "koyu mavi": { tr: "Koyu Mavi", en: "Dark Blue", ru: "Тёмно-синий" },
    "acik mavi": { tr: "Açık Mavi", en: "Light Blue", ru: "Голубой" },
    "acik yesil": { tr: "Açık Yeşil", en: "Light Green", ru: "Светло-зелёный" },
    "acik pembe": { tr: "Açık Pembe", en: "Light Pink", ru: "Светло-розовый" },
    "koyu gri": { tr: "Koyu Gri", en: "Dark Gray", ru: "Тёмно-серый" },
    "acik gri": { tr: "Açık Gri", en: "Light Gray", ru: "Светло-серый" },
    "koyu kahverengi": {
      tr: "Koyu Kahverengi",
      en: "Dark Brown",
      ru: "Тёмно-коричневый",
    },
    // Moda renkleri
    taba: { tr: "Taba", en: "Tan", ru: "Рыжевато-коричневый" },
    murdum: { tr: "Mürdüm", en: "Plum", ru: "Сливовый" },
    kiremit: { tr: "Kiremit", en: "Brick", ru: "Кирпичный" },
    haki: { tr: "Haki", en: "Khaki", ru: "Хаки" },
    mint: { tr: "Mint", en: "Mint", ru: "Мятный" },
    lila: { tr: "Lila", en: "Lilac", ru: "Сиреневый" },
    turkuaz: { tr: "Turkuaz", en: "Turquoise", ru: "Бирюзовый" },
    fusya: { tr: "Fuşya", en: "Fuchsia", ru: "Фуксия" },
    mercan: { tr: "Mercan", en: "Coral", ru: "Коралловый" },
    altin: { tr: "Altın", en: "Gold", ru: "Золотой" },
    gumus: { tr: "Gümüş", en: "Silver", ru: "Серебряный" },
    indigo: { tr: "İndigo", en: "Indigo", ru: "Индиго" },
    antrasit: { tr: "Antrasit", en: "Charcoal", ru: "Антрацитовый" },
    tarcin: { tr: "Tarçın", en: "Cinnamon", ru: "Коричный" },
    hardal: { tr: "Hardal", en: "Mustard", ru: "Горчичный" },
    petrol: { tr: "Petrol", en: "Teal", ru: "Бирюзово-зелёный" },
    pudra: { tr: "Pudra", en: "Powder Pink", ru: "Пудровый" },
    vizon: { tr: "Vizon", en: "Mink", ru: "Норковый" },
    camel: { tr: "Camel", en: "Camel", ru: "Верблюжий" },
    ten: { tr: "Ten", en: "Nude", ru: "Телесный" },
    "buz mavisi": { tr: "Buz Mavisi", en: "Ice Blue", ru: "Ледяной голубой" },
    "gul kurusu": { tr: "Gül Kurusu", en: "Dusty Rose", ru: "Пыльная роза" },
    tas: { tr: "Taş", en: "Stone", ru: "Каменный" },
    sampanya: { tr: "Şampanya", en: "Champagne", ru: "Шампань" },
    zeytin: { tr: "Zeytin", en: "Olive", ru: "Оливковый" },
    leylak: { tr: "Leylak", en: "Lavender", ru: "Лавандовый" },
    somon: { tr: "Somon", en: "Salmon", ru: "Лососёвый" },
    bakir: { tr: "Bakır", en: "Copper", ru: "Медный" },
    celik: { tr: "Çelik", en: "Steel", ru: "Стальной" },
  };

  await prisma.settings.upsert({
    where: { key: "color_translations" },
    update: { value: JSON.stringify(colorTranslations) },
    create: {
      key: "color_translations",
      value: JSON.stringify(colorTranslations),
    },
  });
  console.log(
    `✅ ${Object.keys(colorTranslations).length} color translations seeded`,
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
