import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/database.js";

async function startServer() {
  try {
    // Test database connection
    console.log("🔍 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test query to verify schema
    const adminCount = await prisma.admin.count();
    console.log(`📊 Database check: ${adminCount} admin(s) found`);

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
