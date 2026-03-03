import { prisma } from "../config/database.js";

export interface ExcelProductRow {
  productCode: string;
  productName: string;
  colorCode: string;
  colorName: string;
  size: string;
  barcode: string;
  price: number;
}

export interface ParsedProduct {
  productCode: string;
  productName: string;
  title: string;
  categoryKey: string;
  subcategoryKey: string;
  sizeRange: string;
  price: string;
  colors: string[];
}

// Excel'deki urun adindan kategori ve alt kategori belirle
const CATEGORY_MAP: Record<
  string,
  {
    category: string;
    subcategory: string;
    displayCategory: string;
    displaySubcategory: string;
  }
> = {
  CEKET: {
    category: "ustgiyim",
    subcategory: "ceket",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Ceket & Yelek",
  },
  YELEK: {
    category: "ustgiyim",
    subcategory: "ceket",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Ceket & Yelek",
  },
  GOMLEK: {
    category: "ustgiyim",
    subcategory: "gomlek",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Gomlek",
  },
  BLUZ: {
    category: "ustgiyim",
    subcategory: "bluz",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Bluz",
  },
  TISORT: {
    category: "ustgiyim",
    subcategory: "tisort",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Tisort",
  },
  TRIKO: {
    category: "ustgiyim",
    subcategory: "triko",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Triko",
  },
  PANTOLON: {
    category: "altgiyim",
    subcategory: "pantolon",
    displayCategory: "Alt Giyim",
    displaySubcategory: "Pantolon",
  },
  "DENIM PANTOLON": {
    category: "altgiyim",
    subcategory: "pantolon",
    displayCategory: "Alt Giyim",
    displaySubcategory: "Pantolon",
  },
  ETEK: {
    category: "altgiyim",
    subcategory: "etek",
    displayCategory: "Alt Giyim",
    displaySubcategory: "Etek",
  },
  SORT: {
    category: "altgiyim",
    subcategory: "sort",
    displayCategory: "Alt Giyim",
    displaySubcategory: "Sort",
  },
  TAYT: {
    category: "altgiyim",
    subcategory: "tayt",
    displayCategory: "Alt Giyim",
    displaySubcategory: "Tayt",
  },
  ELBISE: {
    category: "elbise",
    subcategory: "elbise",
    displayCategory: "Elbise & Tulum",
    displaySubcategory: "Elbise",
  },
  "PANTOLONLU TAKIM": {
    category: "takim",
    subcategory: "takim",
    displayCategory: "Takim",
    displaySubcategory: "Takim",
  },
  "YELEKLI TAKIM": {
    category: "takim",
    subcategory: "takim",
    displayCategory: "Takim",
    displaySubcategory: "Takim",
  },
};

function detectCategoryFromName(productName: string): {
  category: string;
  subcategory: string;
  displayCategory: string;
  displaySubcategory: string;
} {
  const upper = productName.toUpperCase();

  // Once cok kelimeli kategorileri kontrol et
  for (const [keyword, mapping] of Object.entries(CATEGORY_MAP)) {
    if (keyword.includes(" ") && upper.includes(keyword)) {
      return mapping;
    }
  }

  // Sonra tek kelimeli kategorileri kontrol et
  for (const [keyword, mapping] of Object.entries(CATEGORY_MAP)) {
    if (!keyword.includes(" ") && upper.includes(keyword)) {
      return mapping;
    }
  }

  // Varsayilan
  return {
    category: "ustgiyim",
    subcategory: "gomlek",
    displayCategory: "Ust Giyim",
    displaySubcategory: "Gomlek",
  };
}

// Beden araligini belirle
function detectSizeRange(sizes: string[]): string {
  const numericSizes = sizes.filter((s) => !isNaN(Number(s))).map(Number);

  if (numericSizes.length > 0) {
    const min = Math.min(...numericSizes);
    const max = Math.max(...numericSizes);
    return `${min}-${max}`;
  }

  // S, M, L gibi harf bedenler
  return sizes.join("-");
}

export interface BulkImportProduct {
  productCode: string;
  productName: string;
  price: number;
  colors: string[];
  sizes: string[];
  barcodes: string[];
}

export interface BulkImportRequest {
  products: BulkImportProduct[];
  brandId?: string;
  status?: string;
}

export async function bulkImportProducts(
  data: BulkImportRequest,
  adminRole: string,
  requiresApproval: boolean,
) {
  const { products, brandId, status: requestedStatus } = data;

  // Status belirleme
  const status =
    requestedStatus !== undefined && requestedStatus !== ""
      ? requestedStatus
      : adminRole === "super_admin"
        ? "approved"
        : requiresApproval
          ? "pending"
          : "approved";

  // Mevcut kategorileri ve alt kategorileri al
  const existingCategories = await prisma.category.findMany({
    include: { subcategories: true },
  });

  const categoryMap = new Map(existingCategories.map((c) => [c.name, c]));
  const subcategoryMap = new Map<string, string>(); // "category:subcategory" -> id

  for (const cat of existingCategories) {
    for (const sub of cat.subcategories) {
      subcategoryMap.set(`${cat.name}:${sub.name}`, sub.id);
    }
  }

  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  // Mevcut urun kodlarini kontrol et
  const existingProducts = await prisma.product.findMany({
    select: { productCode: true },
  });
  const existingCodes = new Set(existingProducts.map((p) => p.productCode));

  for (const product of products) {
    try {
      // Urun kodu zaten varsa atla
      if (existingCodes.has(product.productCode)) {
        results.skipped++;
        results.errors.push(`${product.productCode}: Zaten mevcut, atlanıyor`);
        continue;
      }

      // Kategori tespit et
      const categoryInfo = detectCategoryFromName(product.productName);

      // Kategori yoksa olustur
      let categoryId: string;
      const existingCat = categoryMap.get(categoryInfo.category);
      if (existingCat) {
        categoryId = existingCat.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: categoryInfo.category,
            displayName: categoryInfo.displayCategory,
          },
        });
        categoryId = newCat.id;
        categoryMap.set(categoryInfo.category, {
          ...newCat,
          subcategories: [],
        });
      }

      // Alt kategori yoksa olustur
      let subcategoryId: string | undefined;
      const subKey = `${categoryInfo.category}:${categoryInfo.subcategory}`;
      if (subcategoryMap.has(subKey)) {
        subcategoryId = subcategoryMap.get(subKey);
      } else {
        const newSub = await prisma.subcategory.create({
          data: {
            name: categoryInfo.subcategory,
            displayName: categoryInfo.displaySubcategory,
            categoryId,
          },
        });
        subcategoryId = newSub.id;
        subcategoryMap.set(subKey, newSub.id);
      }

      // Beden araligini belirle
      const sizeRange = detectSizeRange(product.sizes);

      // Urun adini duzenle
      const nameParts = product.productName.split(" - ");
      const title =
        nameParts.length > 1
          ? nameParts.slice(1).join(" - ").trim()
          : product.productName;

      // Urun olustur (barkodlarla birlikte)
      await prisma.product.create({
        data: {
          title,
          productCode: product.productCode,
          shortDesc: product.productName,
          mainImageUrl:
            "https://via.placeholder.com/800x1000.png?text=No+Image",
          categoryId,
          subcategoryId: subcategoryId || null,
          brandId: brandId || null,
          sizeRange,
          price: `${product.price}`,
          barcodes: product.barcodes || [],
          status,
          variants: {
            create: product.colors.map((color) => ({
              sizeRange,
              color,
              price: `${product.price}`,
            })),
          },
        },
      });

      results.created++;
      existingCodes.add(product.productCode);
    } catch (error: any) {
      results.errors.push(
        `${product.productCode}: ${error.message || "Bilinmeyen hata"}`,
      );
    }
  }

  return results;
}

// Urun koduna gore urun bul (fotograf eslestirme icin)
export async function findProductByCode(productCode: string) {
  return prisma.product.findFirst({
    where: { productCode },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
    },
  });
}

// Barkod numarasina gore urun bul
export async function findProductByBarcode(barcode: string) {
  return prisma.product.findFirst({
    where: { barcodes: { has: barcode } },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
    },
  });
}

// Toplu barkod arama - tek istekte birden fazla barkod
export async function findProductsByBarcodes(barcodes: string[]) {
  const products = await prisma.product.findMany({
    where: {
      barcodes: { hasSome: barcodes },
    },
    select: {
      id: true,
      productCode: true,
      title: true,
      barcodes: true,
      images: { select: { id: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  // Her barkod icin hangi urune ait oldugunu maple
  const result: Record<
    string,
    {
      id: string;
      productCode: string;
      title: string;
      imageCount: number;
    } | null
  > = {};

  for (const barcode of barcodes) {
    const product = products.find((p) => p.barcodes.includes(barcode));
    result[barcode] = product
      ? {
          id: product.id,
          productCode: product.productCode,
          title: product.title,
          imageCount: product.images.length,
        }
      : null;
  }

  return result;
}

// Mevcut urune fotograf ekle
export async function addImagesToProduct(
  productId: string,
  imageUrls: string[],
  replaceExisting: boolean = false,
) {
  if (replaceExisting) {
    await prisma.productImage.deleteMany({
      where: { productId },
    });
  }

  // Mevcut en yuksek displayOrder'i bul
  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { displayOrder: "desc" },
  });
  const startOrder = replaceExisting ? 0 : (lastImage?.displayOrder ?? -1) + 1;

  // Ilk gorsel = mainImageUrl olarak da guncelle
  const updateData: Record<string, unknown> = {};
  if (imageUrls.length > 0 && (replaceExisting || !lastImage)) {
    updateData.mainImageUrl = imageUrls[0];
  }

  await prisma.$transaction([
    // Ana gorseli guncelle
    ...(Object.keys(updateData).length > 0
      ? [prisma.product.update({ where: { id: productId }, data: updateData })]
      : []),
    // Yeni gorselleri ekle
    prisma.productImage.createMany({
      data: imageUrls.map((url, index) => ({
        productId,
        imageUrl: url,
        displayOrder: startOrder + index,
      })),
    }),
  ]);

  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
      category: true,
      subcategory: true,
    },
  });
}
