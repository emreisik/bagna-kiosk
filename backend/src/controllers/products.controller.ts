import { Request, Response } from "express";
import * as productsService from "../services/products.service.js";
import * as similarityService from "../services/similarity.service.js";
import { getParam } from "../utils/request.js";

export async function getAllProducts(req: Request, res: Response) {
  const { category, subcategory, search, page, limit } = req.query;

  const products = await productsService.getProducts({
    category: category as string,
    subcategory: subcategory as string,
    search: search as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 50,
  });

  res.json(products);
}

export async function getProductById(req: Request, res: Response) {
  const product = await productsService.getProductById(getParam(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
}

export async function getSimilarProducts(req: Request, res: Response) {
  const product = await productsService.getProductById(getParam(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
  const similar = await similarityService.getSimilarProducts(product, limit);

  res.json(similar);
}

export async function getCategories(req: Request, res: Response) {
  const categories = await productsService.getCategories();
  res.json(categories);
}
