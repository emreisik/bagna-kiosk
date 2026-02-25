import { prisma } from "../config/database.js";

interface CreateOrderInput {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  brandSlug?: string;
  items: Array<{
    productId: string;
    productCode: string;
    title: string;
    price: string;
    sizeRange: string;
    imageUrl: string;
    quantity: number;
    variantId?: string;
    color?: string;
  }>;
}

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

export async function createOrder(input: CreateOrderInput) {
  const orderNumber = generateOrderNumber();

  return prisma.order.create({
    data: {
      orderNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      address: input.address,
      brandSlug: input.brandSlug,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          productCode: item.productCode,
          title: item.title,
          price: item.price,
          sizeRange: item.sizeRange,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          variantId: item.variantId || null,
          color: item.color || null,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

export async function getOrders(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
  ]);

  return {
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({
    where: { id },
  });
}
