import { prisma } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateProductData {
  title: string;
  productCode: string; // Zorunlu
  shortDesc: string;
  mainImageUrl: string;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  sizeRange: string;
  price: string;
  status?: string; // Optional: super_admin can set manually
  images?: Array<{ imageUrl: string; displayOrder: number }>;
  variants?: Array<{ sizeRange: string; color: string; price: string }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export async function login(credentials: LoginCredentials) {
  try {
    console.log("🔐 Admin login attempt:", credentials.email);

    const admin = await prisma.admin.findUnique({
      where: { email: credentials.email },
      include: {
        brands: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!admin) {
      console.log("❌ Admin not found:", credentials.email);
      throw new Error("Invalid credentials");
    }

    console.log("✅ Admin found:", admin.email, "| Role:", admin.role);

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      admin.password,
    );

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", credentials.email);
      throw new Error("Invalid credentials");
    }

    console.log("✅ Password verified for:", credentials.email);

    const token = jwt.sign({ adminId: admin.id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ JWT token generated for:", credentials.email);

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        requiresApproval: admin.requiresApproval,
        brands: admin.brands.map((b) => ({
          brandId: b.brand.id,
          brandName: b.brand.name,
        })),
      },
    };
  } catch (error) {
    console.error("❌ Login service error:", error);
    throw error;
  }
}

export async function createProduct(
  data: CreateProductData,
  adminRole: string,
  requiresApproval: boolean = true,
) {
  // Status logic:
  // 1. If status is explicitly provided in data, use it (manual override)
  // 2. If super_admin → default to "approved"
  // 3. If brand_admin:
  //    - requiresApproval = true → "pending"
  //    - requiresApproval = false → "approved"
  const status =
    data.status !== undefined && data.status !== ""
      ? data.status
      : adminRole === "super_admin"
        ? "approved"
        : requiresApproval
          ? "pending"
          : "approved";

  return prisma.product.create({
    data: {
      title: data.title,
      productCode: data.productCode,
      shortDesc: data.shortDesc,
      mainImageUrl: data.mainImageUrl,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || null,
      brandId: data.brandId || null,
      sizeRange: data.sizeRange,
      price: data.price,
      status,
      images: data.images
        ? {
            create: data.images,
          }
        : undefined,
      variants: data.variants
        ? {
            create: data.variants,
          }
        : undefined,
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
      variants: {
        orderBy: [{ sizeRange: "asc" }, { color: "asc" }],
      },
    },
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProductData,
  adminRole: string,
) {
  // If images are provided, delete existing and create new ones
  if (data.images) {
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
  }

  // If variants are provided, delete existing and create new ones
  if (data.variants) {
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });
  }

  // Status logic:
  // - If status is explicitly provided (by super_admin), use it
  // - Brand admins → status becomes "pending" (requires re-approval)
  // - Super admins without explicit status → don't change status
  console.log("🔍 Status update logic:");
  console.log("  data.status:", data.status);
  console.log("  adminRole:", adminRole);

  const status =
    data.status !== undefined
      ? data.status
      : adminRole === "super_admin"
        ? undefined
        : "pending";

  console.log("  Computed status:", status);
  console.log("  Will update status:", status !== undefined);

  return prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      ...(data.productCode !== undefined && { productCode: data.productCode }),
      shortDesc: data.shortDesc,
      mainImageUrl: data.mainImageUrl,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || null,
      brandId: data.brandId || null,
      sizeRange: data.sizeRange,
      price: data.price,
      ...(status !== undefined && { status }), // Only set status if defined
      images: data.images
        ? {
            create: data.images,
          }
        : undefined,
      variants: data.variants
        ? {
            create: data.variants,
          }
        : undefined,
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
      variants: {
        orderBy: [{ sizeRange: "asc" }, { color: "asc" }],
      },
    },
  });
}

export async function deleteProduct(id: string) {
  // Delete product (cascade will handle images and tags)
  return prisma.product.delete({
    where: { id },
  });
}

export async function approveProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { status: "approved" },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

export async function rejectProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { status: "rejected" },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

export async function createCategory(name: string, displayName: string) {
  return prisma.category.create({
    data: { name, displayName },
  });
}
