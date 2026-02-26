import { Request, Response } from "express";
import * as ordersService from "../services/orders.service.js";

export async function createOrder(req: Request, res: Response) {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    brandSlug,
    language,
    items,
  } = req.body;

  if (!firstName || !phone || !address) {
    return res.status(400).json({ error: "Tum musteri bilgileri zorunludur" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "En az bir urun gereklidir" });
  }

  const order = await ordersService.createOrder({
    firstName,
    lastName,
    email,
    phone,
    address,
    brandSlug,
    language,
    items,
  });

  res.status(201).json(order);
}

export async function getOrders(req: Request, res: Response) {
  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
  const limit =
    typeof req.query.limit === "string" ? parseInt(req.query.limit) : 50;
  const orders = await ordersService.getOrders(page, limit);
  res.json(orders);
}

export async function getOrderById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) {
    return res.status(400).json({ error: "Gecersiz siparis ID" });
  }
  const order = await ordersService.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: "Siparis bulunamadi" });
  }
  res.json(order);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) {
    return res.status(400).json({ error: "Gecersiz siparis ID" });
  }
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status alani zorunludur" });
  }
  const order = await ordersService.updateOrderStatus(id, status);
  res.json(order);
}

export async function deleteOrder(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) {
    return res.status(400).json({ error: "Gecersiz siparis ID" });
  }
  await ordersService.deleteOrder(id);
  res.json({ success: true });
}
