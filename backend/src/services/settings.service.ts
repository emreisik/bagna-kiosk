import { prisma } from "../config/database.js";

export async function getAllSettings() {
  return prisma.settings.findMany();
}

export async function getSettingByKey(key: string) {
  return prisma.settings.findUnique({
    where: { key },
  });
}

export async function upsertSetting(key: string, value: string) {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function deleteSetting(key: string) {
  return prisma.settings.delete({
    where: { key },
  });
}
