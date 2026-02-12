import { prisma } from "../config/database.js";
import bcrypt from "bcryptjs";

export async function getAllUsers() {
  return prisma.admin.findMany({
    include: {
      brands: {
        include: {
          brand: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    include: {
      brands: {
        include: {
          brand: true,
        },
      },
    },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  requiresApproval?: boolean;
  brandIds?: string[];
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.admin.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
      requiresApproval: data.requiresApproval ?? true, // Default to true
      brands: data.brandIds
        ? {
            create: data.brandIds.map((brandId) => ({ brandId })),
          }
        : undefined,
    },
    include: {
      brands: {
        include: {
          brand: true,
        },
      },
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    requiresApproval?: boolean;
    brandIds?: string[];
  },
) {
  const updateData: any = {
    email: data.email,
    name: data.name,
    role: data.role,
  };

  // Update requiresApproval if provided
  if (data.requiresApproval !== undefined) {
    updateData.requiresApproval = data.requiresApproval;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  // If brandIds provided, update brand associations
  if (data.brandIds !== undefined) {
    // Delete existing associations
    await prisma.adminBrand.deleteMany({
      where: { adminId: id },
    });
  }

  const user = await prisma.admin.update({
    where: { id },
    data: updateData,
    include: {
      brands: {
        include: {
          brand: true,
        },
      },
    },
  });

  // Create new associations
  if (data.brandIds && data.brandIds.length > 0) {
    await prisma.adminBrand.createMany({
      data: data.brandIds.map((brandId) => ({
        adminId: id,
        brandId,
      })),
    });
  }

  return getUserById(id);
}

export async function deleteUser(id: string) {
  return prisma.admin.delete({
    where: { id },
  });
}
