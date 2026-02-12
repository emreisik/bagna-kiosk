import { Product } from '../data/products';

/**
 * Get products by category
 */
export function getProductsByCategory(products: Product[], category: string): Product[] {
  return products.filter(p => p.category === category);
}

/**
 * Get products by tag (products must have ALL specified tags)
 */
export function getProductsByTags(products: Product[], tags: string[]): Product[] {
  if (tags.length === 0) return products;
  return products.filter(p => tags.every(tag => p.tags.includes(tag)));
}

/**
 * Search products by query (searches title, description, category, and tags)
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.shortDesc.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get similar products based on category and shared tags
 */
export function getSimilarProducts(
  allProducts: Product[],
  product: Product,
  limit: number = 6
): Product[] {
  return allProducts
    .filter(p => p.id !== product.id)
    .map(p => ({
      product: p,
      score: calculateSimilarityScore(product, p),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
}

/**
 * Calculate similarity score between two products
 */
function calculateSimilarityScore(product1: Product, product2: Product): number {
  let score = 0;
  
  // Same category: +10 points
  if (product1.category === product2.category) {
    score += 10;
  }
  
  // Each shared tag: +5 points
  const sharedTags = product1.tags.filter(tag => product2.tags.includes(tag));
  score += sharedTags.length * 5;
  
  return score;
}

/**
 * Group products by category
 */
export function groupProductsByCategory(products: Product[]): Record<string, Product[]> {
  return products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
}

/**
 * Get all unique tags from products
 */
export function getAllUniqueTags(products: Product[]): string[] {
  const tagSet = new Set<string>();
  products.forEach(p => p.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

/**
 * Get all unique categories from products
 */
export function getAllUniqueCategories(products: Product[]): string[] {
  const categorySet = new Set<string>();
  products.forEach(p => categorySet.add(p.category));
  return Array.from(categorySet).sort();
}

/**
 * Validate product data structure
 */
export function validateProduct(product: any): product is Product {
  return (
    typeof product === 'object' &&
    typeof product.id === 'string' &&
    typeof product.title === 'string' &&
    typeof product.imageUrl === 'string' &&
    typeof product.category === 'string' &&
    Array.isArray(product.tags) &&
    typeof product.shortDesc === 'string' &&
    product.tags.every((tag: any) => typeof tag === 'string')
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
export function getRandomProducts(products: Product[], count: number): Product[] {
  return shuffleProducts(products).slice(0, count);
}

/**
 * Filter products with multiple criteria
 */
export interface FilterCriteria {
  category?: string | null;
  tags?: string[];
  searchQuery?: string;
}

export function filterProducts(products: Product[], criteria: FilterCriteria): Product[] {
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
