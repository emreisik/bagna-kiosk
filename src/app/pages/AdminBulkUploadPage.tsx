import { useState, useEffect } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import { ArrowLeft, FolderOpen, Upload, Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  NotificationModal,
  NotificationType,
} from "../components/admin/NotificationModal";

interface ProductDraft {
  id: string;
  folderName: string; // Ürün kodu olacak
  images: File[];
  imageUrls: string[]; // Upload edilmiş URL'ler
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  sizeRange: string;
  price: string;
  status: "pending" | "approved" | "rejected";
  uploadStatus: "waiting" | "uploading" | "success" | "error";
  errorMessage?: string; // Hata mesajı
}

export function AdminBulkUploadPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
  const userBrandIds = adminUser?.brands?.map((b: any) => b.brandId) || [];
  const requiresApproval = adminUser?.requiresApproval ?? true;

  // Brand-admin için kontroller
  const canEditAllBrands = isSuperAdmin || userBrandIds.length === 0;
  const canEditStatus = isSuperAdmin || !requiresApproval;
  const availableBrands = canEditAllBrands
    ? brands
    : brands.filter((b: any) => userBrandIds.includes(b.id));

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

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

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Dosyaları klasör yollarına göre grupla
    const folderMap = new Map<string, File[]>();

    files.forEach((file) => {
      // webkitRelativePath: "parentFolder/subFolder/image.jpg"
      const parts = file.webkitRelativePath.split("/");

      // İlk klasörü atla (seçilen ana klasör), ikinci seviye klasör adını al
      if (parts.length >= 3) {
        const folderName = parts[1]; // Alt klasör adı = ürün kodu
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(file);
      }
    });

    // Her klasör için bir ürün taslağı oluştur
    const drafts: ProductDraft[] = [];
    folderMap.forEach((images, folderName) => {
      // Brand-admin için tek marka varsa otomatik seç
      const defaultBrandId =
        !canEditAllBrands && availableBrands.length === 1
          ? availableBrands[0].id
          : "";

      // Status: Brand-admin + requiresApproval=true ise "pending"
      const defaultStatus = canEditStatus ? "approved" : "pending";

      drafts.push({
        id: Math.random().toString(36).substring(7),
        folderName,
        images,
        imageUrls: [],
        categoryId: "",
        subcategoryId: "",
        brandId: defaultBrandId,
        sizeRange: "",
        price: "",
        status: defaultStatus,
        uploadStatus: "waiting",
      });
    });

    setProducts(drafts);
  };

  const updateProduct = (id: string, updates: Partial<ProductDraft>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const handleSubmitAll = async () => {
    // Validation: Tüm gerekli alanları kontrol et
    const missingFields = products.filter(
      (p) => !p.categoryId || !p.sizeRange || !p.price || !p.brandId,
    );

    if (missingFields.length > 0) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Eksik Bilgi",
        message:
          "Lütfen tüm ürünler için kategori, marka, beden ve fiyat bilgisi girin!",
        details: missingFields.map(
          (p) => `${p.folderName} - Eksik alanlar mevcut`,
        ),
      });
      return;
    }

    setProcessing(true);

    for (const product of products) {
      try {
        updateProduct(product.id, {
          uploadStatus: "uploading",
          errorMessage: undefined,
        });

        // 1. Görselleri toplu yükle
        const uploadResult = await apiClient.uploadMultipleImages(
          product.images,
          token,
        );
        const uploadedUrls = uploadResult.images.map((img) => img.url);

        // 2. Ürünü oluştur
        await apiClient.adminCreateProduct(
          {
            title: product.folderName,
            productCode: product.folderName,
            shortDesc: product.folderName,
            mainImageUrl: uploadedUrls[0],
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId || undefined,
            brandId: product.brandId || undefined,
            sizeRange: product.sizeRange,
            price: product.price,
            status: product.status,
            images: uploadedUrls.slice(1).map((url, index) => ({
              imageUrl: url,
              displayOrder: index,
            })),
          },
          token,
        );

        updateProduct(product.id, { uploadStatus: "success" });
      } catch (error: any) {
        const errorMessage = error?.message || "Bilinmeyen hata";
        console.error(
          `❌ Ürün oluşturma hatası: ${product.folderName}`,
          "\nHata mesajı:",
          errorMessage,
          "\nÜrün verisi:",
          {
            productCode: product.folderName,
            categoryId: product.categoryId,
            brandId: product.brandId,
            sizeRange: product.sizeRange,
            price: product.price,
            status: product.status,
          },
        );
        updateProduct(product.id, { uploadStatus: "error", errorMessage });
      }
    }

    setProcessing(false);

    // Başarıyla tamamlananları kontrol et
    const successProducts = products.filter(
      (p) => p.uploadStatus === "success",
    );
    const errorProducts = products.filter((p) => p.uploadStatus === "error");
    const successCount = successProducts.length;
    const errorCount = errorProducts.length;

    if (successCount === 0) {
      // Hiçbir ürün eklenemedi
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "İşlem Başarısız",
        message: `Hiçbir ürün eklenemedi!\n\nTüm ürünlerde hata oluştu (${errorCount} hata).`,
        details: errorProducts.map(
          (p) => `${p.folderName}: ${p.errorMessage || "Bilinmeyen hata"}`,
        ),
      });
    } else if (errorCount > 0) {
      // Bazı ürünler başarılı, bazıları hatalı
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Kısmi Başarı",
        message: `${successCount} ürün başarıyla eklendi\n${errorCount} ürün eklenemedi\n\nBaşarılı ürünleri görmek için ürün listesine yönlendiriliyorsunuz...`,
        details: errorProducts.map(
          (p) => `${p.folderName}: ${p.errorMessage || "Bilinmeyen hata"}`,
        ),
      });
      // 3 saniye bekle, sonra ürün listesine git
      setTimeout(() => {
        navigate("/admin/products");
      }, 3000);
    } else {
      // Tüm ürünler başarılı
      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Başarılı!",
        message: `Tüm ürünler başarıyla eklendi (${successCount} ürün).\n\nÜrün listesine yönlendiriliyorsunuz...`,
        details: [],
      });
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    }
  };

  const getSelectedCategory = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Ürünlere Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Toplu Ürün Yükleme
          </h1>
          <p className="text-gray-600 mt-2">
            Klasör seçin - Her alt klasör bir ürün olacak
          </p>
        </div>

        {/* Klasör Seçimi */}
        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Ürün Klasörlerini Seçin
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Ana klasörü seçin. İçindeki her alt klasör bir ürün olacak.
                <br />
                Klasör adı = Ürün Kodu
              </p>
              <label className="inline-block cursor-pointer bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                <input
                  type="file"
                  /* @ts-ignore */
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
                Klasör Seç
              </label>
            </div>
          </div>
        )}

        {/* Ürün Listesi */}
        {products.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{products.length} ürün</strong> hazır. Lütfen her ürün
                için bilgileri girin ve "Tümünü Kaydet" butonuna tıklayın.
              </p>
            </div>

            {products.map((product, index) => {
              const category = getSelectedCategory(product.categoryId);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-6 relative"
                >
                  {/* Status Badge */}
                  {product.uploadStatus !== "waiting" && (
                    <div className="absolute top-4 right-4">
                      {product.uploadStatus === "uploading" && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Yükleniyor...
                        </span>
                      )}
                      {product.uploadStatus === "success" && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Başarılı
                        </span>
                      )}
                      {product.uploadStatus === "error" && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Hata
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-12 gap-6">
                    {/* Sol: Görseller */}
                    <div className="col-span-3">
                      <h4 className="text-sm font-semibold mb-2">
                        Ürün #{index + 1}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        {product.images.length} görsel
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {product.images.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-square bg-gray-100 rounded overflow-hidden"
                          >
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`${product.folderName} ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                      {product.images.length > 4 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{product.images.length - 4} görsel daha
                        </p>
                      )}
                    </div>

                    {/* Sağ: Form */}
                    <div className="col-span-9 grid grid-cols-2 gap-4">
                      {/* Ürün Kodu */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Ürün Kodu *
                        </label>
                        <input
                          type="text"
                          value={product.folderName}
                          readOnly
                          className="w-full px-3 py-2 border rounded bg-gray-50"
                        />
                      </div>

                      {/* Kategori */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Kategori *
                        </label>
                        <select
                          value={product.categoryId}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              categoryId: e.target.value,
                              subcategoryId: "", // Reset subcategory
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                          disabled={product.uploadStatus !== "waiting"}
                        >
                          <option value="">Seçiniz</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Alt Kategori */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Alt Kategori
                        </label>
                        <select
                          value={product.subcategoryId}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              subcategoryId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                          disabled={
                            !product.categoryId ||
                            product.uploadStatus !== "waiting"
                          }
                        >
                          <option value="">Seçiniz</option>
                          {category?.subcategories?.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Marka */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Marka
                        </label>
                        <select
                          value={product.brandId}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              brandId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                          disabled={
                            product.uploadStatus !== "waiting" ||
                            !canEditAllBrands
                          }
                        >
                          {canEditAllBrands && (
                            <option value="">Seçiniz</option>
                          )}
                          {availableBrands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Beden Aralığı */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Beden Aralığı *
                        </label>
                        <select
                          value={product.sizeRange}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              sizeRange: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded"
                          disabled={product.uploadStatus !== "waiting"}
                        >
                          <option value="">Seçiniz</option>
                          <option value="36-42">36-42</option>
                          <option value="42-48">42-48</option>
                          <option value="S-XL">S-XL</option>
                          <option value="M-XXL">M-XXL</option>
                          <option value="XS-L">XS-L</option>
                        </select>
                      </div>

                      {/* Fiyat */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Fiyat *
                        </label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              price: e.target.value,
                            })
                          }
                          placeholder="Örn: 145$"
                          className="w-full px-3 py-2 border rounded"
                          disabled={product.uploadStatus !== "waiting"}
                        />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {[10, 20, 30, 50, 100, 150, 200].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateProduct(product.id, {
                                  price: `${value}`,
                                })
                              }
                              disabled={product.uploadStatus !== "waiting"}
                              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Durum */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Durum
                        </label>
                        <select
                          value={product.status}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              status: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                          disabled={
                            product.uploadStatus !== "waiting" || !canEditStatus
                          }
                        >
                          <option value="pending">Beklemede</option>
                          <option value="approved">Onaylandı</option>
                          <option value="rejected">Reddedildi</option>
                        </select>
                        {!canEditStatus && (
                          <p className="mt-1 text-xs text-gray-500">
                            Ürünler otomatik "Beklemede" olarak oluşturulur.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Alt Butonlar */}
            <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
              <button
                onClick={() => setProducts([])}
                disabled={processing}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                İptal Et
              </button>
              <button
                onClick={handleSubmitAll}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Upload className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Tümünü Kaydet ({products.length} Ürün)
                  </>
                )}
              </button>
            </div>
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
