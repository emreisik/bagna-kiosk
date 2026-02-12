import { prisma } from "../config/database.js";
import {
  Product,
  Category,
  Subcategory,
  ProductImage,
  Brand,
} from "@prisma/client";

type ProductWithRelations = Product & {
  category: Category;
  subcategory: Subcategory | null;
  brand: Brand | null;
  images: ProductImage[];
};

export async function getSimilarProducts(
  product: ProductWithRelations,
  limit: number = 6,
): Promise<ProductWithRelations[]> {
  const allProducts = await prisma.product.findMany({
    where: { id: { not: product.id } },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: { orderBy: { displayOrder: "asc" } },
    },
  });

  const scoredProducts = allProducts.map((p) => ({
    product: p,
    score: calculateSimilarityScore(product, p),
  }));

  scoredProducts.sort((a, b) => b.score - a.score);

  return scoredProducts.slice(0, limit).map((item) => item.product);
}

function calculateSimilarityScore(
  product1: ProductWithRelations,
  product2: ProductWithRelations,
): number {
  let score = 0;

  // Same category: +10 points
  if (product1.categoryId === product2.categoryId) {
    score += 10;
  }

  // Same subcategory: +5 points
  if (
    product1.subcategoryId &&
    product1.subcategoryId === product2.subcategoryId
  ) {
    score += 5;
  }

  // Same brand: +3 points
  if (product1.brandId && product1.brandId === product2.brandId) {
    score += 3;
  }

  return score;
}
