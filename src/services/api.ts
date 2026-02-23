import type { Product } from "../data/products";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Backend API response types
interface ApiProduct {
  id: string;
  title: string;
  productCode: string;
  shortDesc: string;
  mainImageUrl: string;
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  sizeRange: string;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    displayName: string;
  };
  subcategory?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    logo?: string | null;
  } | null;
  images: Array<{
    id: string;
    productId: string;
    imageUrl: string;
    displayOrder: number;
  }>;
}

interface ApiProductsResponse {
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiCategory {
  id: string;
  name: string;
  displayName: string;
  subcategories?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Transform backend API product to frontend Product type
function transformProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    imageUrl: apiProduct.mainImageUrl,
    category: apiProduct.category.displayName,
    subcategory: apiProduct.subcategory?.displayName,
    categoryId: apiProduct.categoryId,
    subcategoryId: apiProduct.subcategoryId || undefined,
    brandId: apiProduct.brandId || undefined,
    brand: apiProduct.brand || undefined,
    tags: [],
    shortDesc: apiProduct.shortDesc,
    images: [
      apiProduct.mainImageUrl,
      ...(apiProduct.images || [])
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((img) => img.imageUrl),
    ],
    productCode: apiProduct.productCode,
    sizeRange: apiProduct.sizeRange,
    price: apiProduct.price,
    status: apiProduct.status,
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getProducts(filters?: ProductFilters): Promise<{
    products: Product[];
    pagination: ApiProductsResponse["pagination"];
  }> {
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.subcategory) params.append("subcategory", filters.subcategory);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<ApiProductsResponse>(endpoint);

    return {
      products: response.data.map(transformProduct),
      pagination: response.pagination,
    };
  }

  async getProductById(id: string): Promise<Product> {
    const apiProduct = await this.request<ApiProduct>(`/products/${id}`);
    return transformProduct(apiProduct);
  }

  async getSimilarProducts(id: string, limit = 6): Promise<Product[]> {
    const apiProducts = await this.request<ApiProduct[]>(
      `/products/${id}/similar?limit=${limit}`,
    );
    return apiProducts.map(transformProduct);
  }

  async getCategories(): Promise<ApiCategory[]> {
    return this.request<ApiCategory[]>("/categories");
  }

  async getSettings(): Promise<Array<{ key: string; value: string }>> {
    return this.request<Array<{ key: string; value: string }>>("/settings");
  }

  // Brands - Public
  async getAllBrands(): Promise<
    {
      id: string;
      name: string;
      slug: string;
      logo?: string;
    }[]
  > {
    return await this.request<
      {
        id: string;
        name: string;
        slug: string;
        logo?: string;
      }[]
    >(`/brands`);
  }

  async getBrandBySlug(slug: string): Promise<{
    id: string;
    name: string;
    slug: string;
    logo?: string;
    products: Product[];
  }> {
    const brand = await this.request<{
      id: string;
      name: string;
      slug: string;
      logo?: string;
      products: ApiProduct[];
    }>(`/brands/${slug}`);

    return {
      ...brand,
      products: brand.products.map(transformProduct),
    };
  }

  // Admin methods
  async adminLogin(
    email: string,
    password: string,
  ): Promise<{
    token: string;
    admin: { id: string; email: string; name: string };
  }> {
    return this.request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async adminCreateProduct(
    product: Omit<ApiProduct, "id" | "createdAt" | "updatedAt">,
    token: string,
  ): Promise<ApiProduct> {
    return this.request("/admin/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    });
  }

  async adminUpdateProduct(
    id: string,
    product: Partial<Omit<ApiProduct, "id" | "createdAt" | "updatedAt">>,
    token: string,
  ): Promise<ApiProduct> {
    return this.request(`/admin/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    });
  }

  async adminDeleteProduct(id: string, token: string): Promise<void> {
    await this.request(`/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminApproveProduct(id: string, token: string): Promise<ApiProduct> {
    return this.request(`/admin/products/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminRejectProduct(id: string, token: string): Promise<ApiProduct> {
    return this.request(`/admin/products/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminGetProducts(
    token: string,
    filters?: ProductFilters,
  ): Promise<{
    products: Product[];
    pagination: ApiProductsResponse["pagination"];
  }> {
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.subcategory) params.append("subcategory", filters.subcategory);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<ApiProductsResponse>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      products: response.data.map(transformProduct),
      pagination: response.pagination,
    };
  }

  // Brands Admin
  async adminGetBrands(token: string): Promise<any[]> {
    return this.request("/admin/brands", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminCreateBrand(
    brand: { name: string; logo?: string },
    token: string,
  ): Promise<any> {
    return this.request("/admin/brands", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(brand),
    });
  }

  async adminUpdateBrand(
    id: string,
    brand: { name?: string; logo?: string },
    token: string,
  ): Promise<any> {
    return this.request(`/admin/brands/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(brand),
    });
  }

  async adminDeleteBrand(id: string, token: string): Promise<void> {
    await this.request(`/admin/brands/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Categories Admin
  async adminCreateCategory(
    category: { name: string; displayName: string },
    token: string,
  ): Promise<any> {
    return this.request("/admin/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(category),
    });
  }

  async adminUpdateCategory(
    id: string,
    category: { name?: string; displayName?: string },
    token: string,
  ): Promise<any> {
    return this.request(`/admin/categories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(category),
    });
  }

  async adminDeleteCategory(id: string, token: string): Promise<void> {
    await this.request(`/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Subcategories Admin
  async adminCreateSubcategory(
    subcategory: { name: string; displayName: string; categoryId: string },
    token: string,
  ): Promise<any> {
    return this.request("/admin/subcategories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(subcategory),
    });
  }

  async adminUpdateSubcategory(
    id: string,
    subcategory: { name?: string; displayName?: string; categoryId?: string },
    token: string,
  ): Promise<any> {
    return this.request(`/admin/subcategories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(subcategory),
    });
  }

  async adminDeleteSubcategory(id: string, token: string): Promise<void> {
    await this.request(`/admin/subcategories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Users Admin
  async adminGetUsers(token: string): Promise<any[]> {
    return this.request("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminCreateUser(
    user: {
      email: string;
      password: string;
      name: string;
      role: string;
      brandIds?: string[];
    },
    token: string,
  ): Promise<any> {
    return this.request("/admin/users", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(user),
    });
  }

  async adminUpdateUser(
    id: string,
    user: {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      brandIds?: string[];
    },
    token: string,
  ): Promise<any> {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(user),
    });
  }

  async adminDeleteUser(id: string, token: string): Promise<void> {
    await this.request(`/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Upload
  async uploadImage(
    file: File,
    token: string,
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${this.baseUrl}/admin/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    // Relative path olarak döndür (Vite proxy dev'de, Express prod'da handle eder)
    return data;
  }

  async uploadMultipleImages(
    files: File[],
    token: string,
  ): Promise<{
    images: Array<{
      url: string;
      filename: string;
      size: number;
      mimetype: string;
    }>;
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${this.baseUrl}/admin/upload/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    // Relative path olarak döndür (Vite proxy dev'de, Express prod'da handle eder)
    return data;
  }

  // Settings Admin
  async adminGetSettings(token: string): Promise<any[]> {
    return this.request("/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminUpsertSetting(
    key: string,
    value: string,
    token: string,
  ): Promise<any> {
    return this.request("/admin/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, value }),
    });
  }

  async adminClearCache(token: string): Promise<any> {
    return this.request("/admin/settings/clear-cache", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const apiClient = new ApiClient(API_URL);
