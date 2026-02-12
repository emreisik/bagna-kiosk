import { prisma } from "../config/database.js";
import { Prisma } from "@prisma/client";

interface GetProductsParams {
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  limit?: number;
  brandIds?: string[]; // For filtering by admin's authorized brands
}

export async function getProducts(params: GetProductsParams) {
  const {
    category,
    subcategory,
    search,
    page = 1,
    limit = 50,
    brandIds,
  } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  // Public API: Only show approved products (brandIds = undefined)
  // Admin API: Show all statuses (brandIds = [] for super_admin, or [id1, id2] for brand_admin)
  if (brandIds === undefined) {
    where.status = "approved";
  }

  if (category) {
    where.category = { name: category };
  }

  if (subcategory) {
    where.subcategory = { name: subcategory };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { productCode: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by authorized brands (for brand admins)
  if (brandIds && brandIds.length > 0) {
    where.brandId = { in: brandIds };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      subcategories: true,
    },
  });
}
