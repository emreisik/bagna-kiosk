import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/database.js";

// Varsayilan renk cevirilerini DB'ye yaz (yoksa)
async function seedDefaultSettings() {
  const existing = await prisma.settings.findUnique({
    where: { key: "color_translations" },
  });
  const colorTranslations: Record<string, Record<string, string>> = {
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
    vanilya: { tr: "Vanilya", en: "Vanilla", ru: "Ванильный" },
    visne: { tr: "Vişne", en: "Cherry", ru: "Вишнёвый" },
  };

  if (existing) {
    // Mevcut veriyle merge et (eksik renkleri ekle)
    const current = JSON.parse(existing.value) as Record<
      string,
      Record<string, string>
    >;
    let added = 0;
    for (const [key, value] of Object.entries(colorTranslations)) {
      if (!current[key]) {
        current[key] = value;
        added++;
      }
    }
    if (added > 0) {
      await prisma.settings.update({
        where: { key: "color_translations" },
        data: { value: JSON.stringify(current) },
      });
      console.log(
        `🎨 ${added} yeni renk cevirisi eklendi (toplam: ${Object.keys(current).length})`,
      );
    }
  } else {
    // Ilk kez olustur
    await prisma.settings.create({
      data: {
        key: "color_translations",
        value: JSON.stringify(colorTranslations),
      },
    });
    console.log(
      `🎨 ${Object.keys(colorTranslations).length} renk cevirisi yazildi`,
    );
  }
}

async function startServer() {
  try {
    // Test database connection
    console.log("🔍 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test query to verify schema
    const adminCount = await prisma.admin.count();
    console.log(`📊 Database check: ${adminCount} admin(s) found`);

    // Varsayilan settings'leri kontrol et ve yoksa olustur
    await seedDefaultSettings();

    const app = await createApp();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`✅ Health check: http://localhost:${config.PORT}/health`);
      console.log(`📡 API: http://localhost:${config.PORT}/api/products`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
    process.exit(1);
  }
}

startServer();
