import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/database.js";
import {
  defaultTranslationsPayload,
  defaultColorTranslations,
} from "./data/defaultTranslations.js";

// Varsayilan settings'leri DB'ye yaz (yoksa olustur, varsa eksik key'leri merge et)
async function seedDefaultSettings() {
  // 1. Ceviriler (translations)
  const existingTranslations = await prisma.settings.findUnique({
    where: { key: "translations" },
  });
  if (!existingTranslations) {
    await prisma.settings.create({
      data: {
        key: "translations",
        value: JSON.stringify(defaultTranslationsPayload),
      },
    });
    console.log(
      `🌐 ${Object.keys(defaultTranslationsPayload.data).length} ceviri key'i yazildi`,
    );
  }

  // 2. Renk cevirileri (color_translations)
  const existingColors = await prisma.settings.findUnique({
    where: { key: "color_translations" },
  });
  if (existingColors) {
    // Mevcut veriyle merge et (eksik renkleri ekle)
    const current = JSON.parse(existingColors.value) as Record<
      string,
      Record<string, string>
    >;
    let added = 0;
    for (const [key, value] of Object.entries(defaultColorTranslations)) {
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
    await prisma.settings.create({
      data: {
        key: "color_translations",
        value: JSON.stringify(defaultColorTranslations),
      },
    });
    console.log(
      `🎨 ${Object.keys(defaultColorTranslations).length} renk cevirisi yazildi`,
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
