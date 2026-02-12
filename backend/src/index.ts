import { createApp } from "./app.js";
import { config } from "./config/env.js";

const app = await createApp();

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`✅ Health check: http://localhost:${config.PORT}/health`);
  console.log(`📡 API: http://localhost:${config.PORT}/api/products`);
});
