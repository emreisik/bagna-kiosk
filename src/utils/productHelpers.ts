import { Product } from "../data/products";

/**
 * Get products by category
 */
export function getProductsByCategory(
  products: Product[],
  category: string,
): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * Get products by tag (products must have ALL specified tags)
 */
export function getProductsByTags(
  products: Product[],
  tags: string[],
): Product[] {
  if (tags.length === 0) return products;
  return products.filter((p) => tags.every((tag) => p.tags.includes(tag)));
}

/**
 * Search products by query (searches title, description, category, and tags)
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;

  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.shortDesc.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}

/**
 * Get similar products based on category and shared tags
 */
export function getSimilarProducts(
  allProducts: Product[],
  product: Product,
  limit: number = 6,
): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      product: p,
      score: calculateSimilarityScore(product, p),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Calculate similarity score between two products
 */
function calculateSimilarityScore(
  product1: Product,
  product2: Product,
): number {
  let score = 0;

  // Same category: +10 points
  if (product1.category === product2.category) {
    score += 10;
  }

  // Each shared tag: +5 points
  const sharedTags = product1.tags.filter((tag) => product2.tags.includes(tag));
  score += sharedTags.length * 5;

  return score;
}

/**
 * Group products by category
 */
export function groupProductsByCategory(
  products: Product[],
): Record<string, Product[]> {
  return products.reduce(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );
}

/**
 * Get all unique tags from products
 */
export function getAllUniqueTags(products: Product[]): string[] {
  const tagSet = new Set<string>();
  products.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

/**
 * Get all unique categories from products
 */
export function getAllUniqueCategories(products: Product[]): string[] {
  const categorySet = new Set<string>();
  products.forEach((p) => categorySet.add(p.category));
  return Array.from(categorySet).sort();
}

/**
 * Validate product data structure
 */
export function validateProduct(product: any): product is Product {
  return (
    typeof product === "object" &&
    typeof product.id === "string" &&
    typeof product.title === "string" &&
    typeof product.imageUrl === "string" &&
    typeof product.category === "string" &&
    Array.isArray(product.tags) &&
    typeof product.shortDesc === "string" &&
    product.tags.every((tag: any) => typeof tag === "string")
  );
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleProducts(products: Product[]): Product[] {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random products
 */
export function getRandomProducts(
  products: Product[],
  count: number,
): Product[] {
  return shuffleProducts(products).slice(0, count);
}

/**
 * Harf bedenleri sıra haritası
 */
const letterSizeOrder: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  "2XL": 6,
  "3XL": 7,
  XXXL: 7,
};

/**
 * Seri beden aralığından beden sayısını hesapla
 * "36-42" → 4 (36, 38, 40, 42 - 2'şer artar)
 * "36-40" → 3 (36, 38, 40)
 * "S-XL"  → 4 (S, M, L, XL)
 * "42"    → 1 (tek beden)
 */
export function getSizeCount(sizeRange: string): number {
  if (!sizeRange) return 1;

  const parts = sizeRange.split("-").map((s) => s.trim());
  if (parts.length !== 2) return 1;

  const [startStr, endStr] = parts;

  // Sayısal beden aralığı: "36-42"
  const startNum = parseInt(startStr);
  const endNum = parseInt(endStr);
  if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
    return (endNum - startNum) / 2 + 1;
  }

  // Harf beden aralığı: "S-XL"
  const startOrder = letterSizeOrder[startStr.toUpperCase()];
  const endOrder = letterSizeOrder[endStr.toUpperCase()];
  if (
    startOrder !== undefined &&
    endOrder !== undefined &&
    endOrder >= startOrder
  ) {
    return endOrder - startOrder + 1;
  }

  return 1;
}

/**
 * Seri fiyatı hesapla: birim fiyat × beden sayısı
 */
export function getSeriesPrice(unitPrice: number, sizeRange: string): number {
  return unitPrice * getSizeCount(sizeRange);
}

/**
 * Harf bedenleri ters haritası (order → label)
 */
const orderToLetter: Record<number, string> = {
  1: "XS",
  2: "S",
  3: "M",
  4: "L",
  5: "XL",
  6: "XXL",
  7: "3XL",
};

/**
 * Seri beden aralığından tüm bedenlerin listesini döndür
 * "36-42" → ["36", "38", "40", "42"]
 * "S-XL"  → ["S", "M", "L", "XL"]
 * "42"    → ["42"]
 */
export function getSizeList(sizeRange: string): string[] {
  if (!sizeRange) return [sizeRange || ""];

  const parts = sizeRange.split("-").map((s) => s.trim());
  if (parts.length !== 2) return [sizeRange];

  const [startStr, endStr] = parts;

  // Sayısal: "36-42"
  const startNum = parseInt(startStr);
  const endNum = parseInt(endStr);
  if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
    const sizes: string[] = [];
    for (let i = startNum; i <= endNum; i += 2) {
      sizes.push(i.toString());
    }
    return sizes;
  }

  // Harf: "S-XL"
  const startOrder = letterSizeOrder[startStr.toUpperCase()];
  const endOrder = letterSizeOrder[endStr.toUpperCase()];
  if (
    startOrder !== undefined &&
    endOrder !== undefined &&
    endOrder >= startOrder
  ) {
    const sizes: string[] = [];
    for (let i = startOrder; i <= endOrder; i++) {
      sizes.push(orderToLetter[i] || i.toString());
    }
    return sizes;
  }

  return [sizeRange];
}

/**
 * Filter products with multiple criteria
 */
export interface FilterCriteria {
  category?: string | null;
  tags?: string[];
  searchQuery?: string;
}

export function filterProducts(
  products: Product[],
  criteria: FilterCriteria,
): Product[] {
  let filtered = [...products];

  // Apply category filter
  if (criteria.category) {
    filtered = getProductsByCategory(filtered, criteria.category);
  }

  // Apply tags filter
  if (criteria.tags && criteria.tags.length > 0) {
    filtered = getProductsByTags(filtered, criteria.tags);
  }

  // Apply search filter
  if (criteria.searchQuery) {
    filtered = searchProducts(filtered, criteria.searchQuery);
  }

  return filtered;
}
