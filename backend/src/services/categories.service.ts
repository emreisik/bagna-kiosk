import { prisma } from "../config/database.js";

// Categories CRUD
export async function createCategory(data: {
  name: string;
  displayName: string;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: { name?: string; displayName?: string },
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  });
}

// Subcategories CRUD
export async function createSubcategory(data: {
  name: string;
  displayName: string;
  categoryId: string;
}) {
  return prisma.subcategory.create({ data });
}

export async function updateSubcategory(
  id: string,
  data: { name?: string; displayName?: string; categoryId?: string },
) {
  return prisma.subcategory.update({
    where: { id },
    data,
  });
}

export async function deleteSubcategory(id: string) {
  return prisma.subcategory.delete({
    where: { id },
  });
}
