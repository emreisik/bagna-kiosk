import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Neon PgBouncer uyumluluğu: pgbouncer=true parametresi ekle
function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("pgbouncer=true")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatasourceUrl(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
