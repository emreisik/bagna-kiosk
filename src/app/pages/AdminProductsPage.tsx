import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import { useCurrency } from "../../hooks/useCurrency";
import { Plus, Pencil, Trash2, Check, XCircle, FolderPlus } from "lucide-react";
import {
  NotificationModal,
  NotificationType,
} from "../components/admin/NotificationModal";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]); // Tüm ürünler (filtreleme için)
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const currency = useCurrency();

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subcategory: "",
    brand: "",
    status: "",
  });

  // Notification Modal State
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: "info" as NotificationType,
    title: "",
    message: "",
    details: [] as string[],
  });

  const token = localStorage.getItem("adminToken") || "";
  const adminUserStr = localStorage.getItem("adminUser");
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  const isSuperAdmin = adminUser?.role === "super_admin";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.adminGetProducts(token);
      setAllProducts(data.products);
      applyFilters(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await apiClient.adminGetBrands(token);
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const applyFilters = (productList: any[] = allProducts) => {
    let filtered = [...productList];

    // Search filter (ürün kodu veya genel arama)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productCode.toLowerCase().includes(searchLower) ||
          p.title.toLowerCase().includes(searchLower) ||
          p.shortDesc.toLowerCase().includes(searchLower),
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter((p) => p.subcategory === filters.subcategory);
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter((p) => p.brandId === filters.brand);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    setProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeletingId(id);
    try {
      await apiClient.adminDeleteProduct(id, token);
      fetchProducts();
      // Invalidate products cache to refresh all product lists
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      alert("Silme işlemi başarısız oldu");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Bu ürünü onaylamak istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await apiClient.adminApproveProduct(id, token);
      fetchProducts();
      // Invalidate products cache to refresh all product lists
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Ürün onaylandı");
    } catch (error) {
      alert("Onaylama işlemi başarısız oldu");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Bu ürünü reddetmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await apiClient.adminRejectProduct(id, token);
      fetchProducts();
      // Invalidate products cache to refresh all product lists
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Ürün reddedildi");
    } catch (error) {
      alert("Reddetme işlemi başarısız oldu");
    }
  };

  // Toplu seçim fonksiyonları
  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toplu işlem fonksiyonları
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Uyarı",
        message: "Lütfen silmek istediğiniz ürünleri seçin.",
        details: [],
      });
      return;
    }

    if (
      !confirm(`${selectedIds.size} ürünü silmek istediğinizden emin misiniz?`)
    ) {
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];

    for (const id of selectedIds) {
      try {
        await apiClient.adminDeleteProduct(id, token);
      } catch (error: any) {
        const product = products.find((p) => p.id === id);
        errors.push(
          `${product?.productCode || id}: ${error?.message || "Bilinmeyen hata"}`,
        );
      }
    }

    setIsProcessing(false);
    await fetchProducts();
    // Invalidate products cache to refresh all product lists
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    setSelectedIds(new Set());

    if (errors.length === 0) {
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Başarılı!",
        message: `${selectedIds.size} ürün başarıyla silindi.`,
        details: [],
      });
    } else {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Kısmi Başarı",
        message: `${selectedIds.size - errors.length} ürün silindi.\n${errors.length} ürün silinemedi.`,
        details: errors,
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Uyarı",
        message: "Lütfen onaylamak istediğiniz ürünleri seçin.",
        details: [],
      });
      return;
    }

    if (
      !confirm(
        `${selectedIds.size} ürünü onaylamak istediğinizden emin misiniz?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];

    for (const id of selectedIds) {
      try {
        await apiClient.adminApproveProduct(id, token);
      } catch (error: any) {
        const product = products.find((p) => p.id === id);
        errors.push(
          `${product?.productCode || id}: ${error?.message || "Bilinmeyen hata"}`,
        );
      }
    }

    setIsProcessing(false);
    await fetchProducts();
    // Invalidate products cache to refresh all product lists
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    setSelectedIds(new Set());

    if (errors.length === 0) {
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Başarılı!",
        message: `${selectedIds.size} ürün başarıyla onaylandı.`,
        details: [],
      });
    } else {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Kısmi Başarı",
        message: `${selectedIds.size - errors.length} ürün onaylandı.\n${errors.length} ürün onaylanamadı.`,
        details: errors,
      });
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Uyarı",
        message: "Lütfen reddetmek istediğiniz ürünleri seçin.",
        details: [],
      });
      return;
    }

    if (
      !confirm(
        `${selectedIds.size} ürünü reddetmek istediğinizden emin misiniz?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];

    for (const id of selectedIds) {
      try {
        await apiClient.adminRejectProduct(id, token);
      } catch (error: any) {
        const product = products.find((p) => p.id === id);
        errors.push(
          `${product?.productCode || id}: ${error?.message || "Bilinmeyen hata"}`,
        );
      }
    }

    setIsProcessing(false);
    await fetchProducts();
    // Invalidate products cache to refresh all product lists
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    setSelectedIds(new Set());

    if (errors.length === 0) {
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Başarılı!",
        message: `${selectedIds.size} ürün başarıyla reddedildi.`,
        details: [],
      });
    } else {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Kısmi Başarı",
        message: `${selectedIds.size - errors.length} ürün reddedildi.\n${errors.length} ürün reddedilemedi.`,
        details: errors,
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/products/bulk-upload")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FolderPlus className="w-5 h-5" />
              Toplu Ürün Ekle
            </button>
            <button
              onClick={() => navigate("/admin/products/new")}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-5 h-5" />
              Yeni Ürün
            </button>
          </div>
        </div>

        {/* Gelişmiş Filtreleme */}
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtrele</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Arama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama (Kod/Ad)
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Ürün kodu veya ad..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value,
                    subcategory: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.displayName}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Alt Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Kategori
              </label>
              <select
                value={filters.subcategory}
                onChange={(e) =>
                  setFilters({ ...filters, subcategory: e.target.value })
                }
                disabled={!filters.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Tümü</option>
                {filters.category &&
                  categories
                    .find((c) => c.displayName === filters.category)
                    ?.subcategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.displayName}>
                        {sub.displayName}
                      </option>
                    ))}
              </select>
            </div>

            {/* Marka */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka
              </label>
              <select
                value={filters.brand}
                onChange={(e) =>
                  setFilters({ ...filters, brand: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
          </div>

          {/* Filtreleri Temizle */}
          {(filters.search ||
            filters.category ||
            filters.brand ||
            filters.status) && (
            <div className="mt-4">
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    category: "",
                    subcategory: "",
                    brand: "",
                    status: "",
                  })
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ✕ Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* Toplu İşlemler Toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedIds.size} ürün seçildi
              </p>
              <div className="flex gap-3">
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={handleBulkApprove}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      Toplu Onayla
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Toplu Reddet
                    </button>
                  </>
                )}
                <button
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Toplu Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">Henüz ürün yok</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === products.length &&
                        products.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-24 h-24 object-contain rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.productCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {product.category}
                        </span>
                        {product.subcategory && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-gray-400">→</span>
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.replace(/[$€₺£¥₽]+$/g, "").trim()}{" "}
                      {currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : product.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status === "approved"
                          ? "Onaylandı"
                          : product.status === "rejected"
                            ? "Reddedildi"
                            : "Bekliyor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isSuperAdmin && product.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(product.id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                            title="Onayla"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(product.id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                            title="Reddet"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/admin/products/${product.id}/edit`)
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Düzenle"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() =>
          setNotificationModal({ ...notificationModal, isOpen: false })
        }
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        details={notificationModal.details}
      />
    </AdminLayout>
  );
}
