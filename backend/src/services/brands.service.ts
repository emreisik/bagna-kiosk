import { prisma } from "../config/database.js";

export async function getAllBrands() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      products: true,
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "approved" }, // Only show approved products on public pages
        include: {
          category: true,
          subcategory: true,
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function createBrand(data: { name: string; logo?: string }) {
  const slug = generateSlug(data.name);
  return prisma.brand.create({
    data: {
      ...data,
      slug,
    },
  });
}

export async function updateBrand(
  id: string,
  data: { name?: string; logo?: string },
) {
  const updateData: any = { ...data };

  // If name is being updated, regenerate slug
  if (data.name) {
    updateData.slug = generateSlug(data.name);
  }

  return prisma.brand.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteBrand(id: string) {
  // Set brandId to null for all products before deleting
  await prisma.product.updateMany({
    where: { brandId: id },
    data: { brandId: null },
  });

  return prisma.brand.delete({
    where: { id },
  });
}
