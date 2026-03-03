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
  existingProductId?: string; // Mevcut urun varsa ID'si
  existingImageCount?: number; // Mevcut gorsel sayisi
  mode: "create" | "update"; // Yeni urun mu, mevcut urune foto ekle mi
}

export function AdminBulkUploadPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  // Toplu seçim state'leri
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkSubcategoryId, setBulkSubcategoryId] = useState("");
  const [bulkBrandId, setBulkBrandId] = useState("");
  const [bulkSizeRange, setBulkSizeRange] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");

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

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setProcessing(true);

    // Dosya derinligini kontrol et: flat (2 seviye) vs nested (3+ seviye)
    const hasSubfolders = files.some(
      (f) => f.webkitRelativePath.split("/").length >= 3,
    );

    if (hasSubfolders) {
      // MEVCUT DAVRANIS: Alt klasor bazli (klasor adi = urun kodu)
      await handleSubfolderMode(files);
    } else {
      // YENI: Flat folder + barkod esleme (dosya adi = barkod_sira.jpg)
      await handleBarcodeMode(files);
    }

    setProcessing(false);
  };

  // Alt klasor bazli yukleme (mevcut davranis)
  const handleSubfolderMode = async (files: File[]) => {
    const folderMap = new Map<string, File[]>();

    files.forEach((file) => {
      const parts = file.webkitRelativePath.split("/");
      if (parts.length >= 3) {
        const folderName = parts[1];
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(file);
      }
    });

    const drafts: ProductDraft[] = [];

    for (const [folderName, images] of folderMap) {
      const defaultBrandId =
        !canEditAllBrands && availableBrands.length === 1
          ? availableBrands[0].id
          : "";
      const defaultStatus = canEditStatus ? "approved" : "pending";

      let mode: "create" | "update" = "create";
      let existingProductId: string | undefined;
      let existingImageCount: number | undefined;

      try {
        const check = await apiClient.adminCheckProductCode(folderName, token);
        if (check.exists && check.product) {
          mode = "update";
          existingProductId = check.product.id;
          existingImageCount = check.product.imageCount;
        }
      } catch {
        // Kontrol basarisiz olursa yeni urun olarak devam et
      }

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
        mode,
        existingProductId,
        existingImageCount,
      });
    }

    setProducts(drafts);
  };

  // Barkod bazli flat folder yukleme
  const handleBarcodeMode = async (files: File[]) => {
    // 1. Dosyalari barkod prefix'ine gore grupla
    const barcodeMap = new Map<string, File[]>();

    for (const file of files) {
      const fileName = file.name.replace(/\.[^.]+$/, ""); // uzantiyi cikar
      const barcode = fileName.split("_")[0]; // 8680699097936_1 -> 8680699097936
      if (!barcode || barcode.length < 5) continue; // cok kisa barkodlari atla

      if (!barcodeMap.has(barcode)) {
        barcodeMap.set(barcode, []);
      }
      barcodeMap.get(barcode)!.push(file);
    }

    // 2. Tum barkodlari tek istekte ara (toplu arama)
    const allBarcodes = [...barcodeMap.keys()];
    let barcodeResults: Record<
      string,
      {
        id: string;
        productCode: string;
        title: string;
        imageCount: number;
      } | null
    > = {};

    try {
      barcodeResults = await apiClient.adminFindByBarcodes(allBarcodes, token);
    } catch {
      console.error("Toplu barkod arama basarisiz");
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Barkod Arama Hatasi",
        message: "Barkod arama sirasinda hata olustu. Lutfen tekrar deneyin.",
        details: [],
      });
      return;
    }

    // 3. Barkodlari urun bazinda grupla
    const productPhotoMap = new Map<
      string,
      {
        product: {
          id: string;
          productCode: string;
          title: string;
          imageCount: number;
        };
        images: File[];
      }
    >();

    for (const [barcode, photos] of barcodeMap) {
      const product = barcodeResults[barcode];
      if (!product) continue; // eslesmemis barkod

      if (!productPhotoMap.has(product.productCode)) {
        productPhotoMap.set(product.productCode, { product, images: [] });
      }
      const sorted = [...photos].sort((a, b) => a.name.localeCompare(b.name));
      productPhotoMap.get(product.productCode)!.images.push(...sorted);
    }

    // 4. Eslesmemis barkodlari kontrol et
    const unmatchedBarcodes = allBarcodes.filter((b) => !barcodeResults[b]);

    if (unmatchedBarcodes.length > 0) {
      console.warn("Eslesmemis barkodlar:", unmatchedBarcodes);
    }

    // 5. Draft'lari olustur
    const drafts: ProductDraft[] = [];

    for (const [productCode, { product, images }] of productPhotoMap) {
      drafts.push({
        id: Math.random().toString(36).substring(7),
        folderName: productCode,
        images,
        imageUrls: [],
        categoryId: "",
        subcategoryId: "",
        brandId: "",
        sizeRange: "",
        price: "",
        status: "approved",
        uploadStatus: "waiting",
        mode: "update",
        existingProductId: product.id,
        existingImageCount: product.imageCount,
      });
    }

    if (drafts.length === 0 && unmatchedBarcodes.length > 0) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Eslestirme Basarisiz",
        message: `${unmatchedBarcodes.length} barkod icin urun bulunamadi. Once CSV ile urunleri import edin.`,
        details: unmatchedBarcodes.slice(0, 10).map((b) => `Barkod: ${b}`),
      });
      return;
    }

    if (unmatchedBarcodes.length > 0) {
      setNotificationModal({
        isOpen: true,
        type: "warning",
        title: "Kismi Eslestirme",
        message: `${drafts.length} urun eslesti, ${unmatchedBarcodes.length} barkod eslesemedi.`,
        details: unmatchedBarcodes.slice(0, 10).map((b) => `Barkod: ${b}`),
      });
    }

    setProducts(drafts);
  };

  const updateProduct = (id: string, updates: Partial<ProductDraft>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  // Toplu seçimi tüm ürünlere uygula
  const applyBulkToAll = () => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.uploadStatus !== "waiting") return p;
        const updates: Partial<ProductDraft> = {};
        if (bulkCategoryId) {
          updates.categoryId = bulkCategoryId;
          updates.subcategoryId = bulkSubcategoryId || "";
        }
        if (bulkBrandId) updates.brandId = bulkBrandId;
        if (bulkSizeRange) updates.sizeRange = bulkSizeRange;
        if (bulkPrice) updates.price = bulkPrice;
        return { ...p, ...updates };
      }),
    );
  };

  const bulkCategory = categories.find((c) => c.id === bulkCategoryId);

  // Tek urun icin upload islemi
  const uploadSingleProduct = async (product: ProductDraft) => {
    try {
      updateProduct(product.id, {
        uploadStatus: "uploading",
        errorMessage: undefined,
      });

      // Cok fazla gorsel varsa parcalayarak yukle (max 50 per request)
      const BATCH_SIZE = 50;
      const allUploadedUrls: string[] = [];

      for (let i = 0; i < product.images.length; i += BATCH_SIZE) {
        const batch = product.images.slice(i, i + BATCH_SIZE);
        const uploadResult = await apiClient.uploadMultipleImages(batch, token);
        allUploadedUrls.push(...uploadResult.images.map((img) => img.url));
      }

      if (product.mode === "update") {
        await apiClient.adminAddPhotosToProduct(
          product.folderName,
          allUploadedUrls,
          true,
          token,
        );
      } else {
        await apiClient.adminCreateProduct(
          {
            title: product.folderName,
            productCode: product.folderName,
            shortDesc: product.folderName,
            mainImageUrl: allUploadedUrls[0],
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId || undefined,
            brandId: product.brandId || undefined,
            sizeRange: product.sizeRange,
            price: product.price,
            status: product.status,
            images: allUploadedUrls.slice(1).map((url, index) => ({
              imageUrl: url,
              displayOrder: index,
            })),
          } as any,
          token,
        );
      }

      updateProduct(product.id, { uploadStatus: "success" });
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Bilinmeyen hata";
      console.error(
        `Urun islemi hatasi: ${product.folderName} (${product.mode})`,
        "\nHata mesaji:",
        errorMessage,
      );
      updateProduct(product.id, { uploadStatus: "error", errorMessage });
      return false;
    }
  };

  const handleSubmitAll = async () => {
    // Validation: Sadece yeni ürünler için zorunlu alanları kontrol et
    const newProducts = products.filter((p) => p.mode === "create");
    const missingFields = newProducts.filter(
      (p) => !p.categoryId || !p.sizeRange || !p.price || !p.brandId,
    );

    if (missingFields.length > 0) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Eksik Bilgi",
        message:
          "Lütfen yeni ürünler için kategori, marka, beden ve fiyat bilgisi girin!",
        details: missingFields.map(
          (p) => `${p.folderName} - Eksik alanlar mevcut`,
        ),
      });
      return;
    }

    setProcessing(true);
    setUploadProgress({ current: 0, total: products.length });

    // 3 urun ayni anda paralel yukle
    const CONCURRENCY = 3;
    let completed = 0;

    for (let i = 0; i < products.length; i += CONCURRENCY) {
      const batch = products.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map((p) => uploadSingleProduct(p)));
      completed += batch.length;
      setUploadProgress({ current: completed, total: products.length });
    }

    setProcessing(false);

    // Sonuclari products state'inden oku (guncel deger icin)
    setProducts((prev) => {
      const successCount = prev.filter(
        (p) => p.uploadStatus === "success",
      ).length;
      const errorProducts = prev.filter((p) => p.uploadStatus === "error");
      const errorCount = errorProducts.length;

      if (successCount === 0) {
        setNotificationModal({
          isOpen: true,
          type: "error",
          title: "Islem Basarisiz",
          message: `Hicbir urun eklenemedi!\n\nTum urunlerde hata olustu (${errorCount} hata).`,
          details: errorProducts.map(
            (p) => `${p.folderName}: ${p.errorMessage || "Bilinmeyen hata"}`,
          ),
        });
      } else if (errorCount > 0) {
        setNotificationModal({
          isOpen: true,
          type: "warning",
          title: "Kismi Basari",
          message: `${successCount} urun basariyla eklendi\n${errorCount} urun eklenemedi`,
          details: errorProducts.map(
            (p) => `${p.folderName}: ${p.errorMessage || "Bilinmeyen hata"}`,
          ),
        });
        setTimeout(() => navigate("/admin/products"), 3000);
      } else {
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Basarili!",
          message: `Tum urunler basariyla eklendi (${successCount} urun).\n\nUrun listesine yonlendiriliyorsunuz...`,
          details: [],
        });
        setTimeout(() => navigate("/admin/products"), 2000);
      }

      return prev;
    });
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
              {processing ? (
                <>
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Barkodlar Eslestiriliyor...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fotograflar urunlerle eslestirilirken lutfen bekleyin
                  </p>
                </>
              ) : (
                <>
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Foto Klasorunu Secin
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Iki mod desteklenir:
                  </p>
                  <div className="text-xs text-gray-500 mb-6 space-y-1">
                    <p>
                      <strong>1. Barkod modu:</strong> Tek klasorde barkod adli
                      fotograflar (8680699097936_1.jpg) → otomatik urun
                      eslestirme
                    </p>
                    <p>
                      <strong>2. Klasor modu:</strong> Her alt klasor = urun
                      kodu → klasor adi ile eslestirme
                    </p>
                  </div>
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Ürün Listesi */}
        {products.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{products.length} klasör</strong> bulundu.
                {products.filter((p) => p.mode === "update").length > 0 && (
                  <>
                    {" "}
                    <span className="font-semibold text-blue-700">
                      {products.filter((p) => p.mode === "update").length}{" "}
                      mevcut ürün
                    </span>{" "}
                    (fotoğraf güncellenecek),{" "}
                    <span className="font-semibold text-green-700">
                      {products.filter((p) => p.mode === "create").length} yeni
                      ürün
                    </span>{" "}
                    (oluşturulacak).
                  </>
                )}
                {products.filter((p) => p.mode === "update").length === 0 &&
                  ' Lütfen her ürün için bilgileri girin ve "Tümünü Kaydet" butonuna tıklayın.'}
              </p>
            </div>

            {/* Toplu Ayar Paneli */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Tümüne Uygula
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Toplu Kategori */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Kategori
                  </label>
                  <select
                    value={bulkCategoryId}
                    onChange={(e) => {
                      setBulkCategoryId(e.target.value);
                      setBulkSubcategoryId("");
                    }}
                    className="w-full px-2 py-2 border rounded text-sm"
                    disabled={processing}
                  >
                    <option value="">-</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toplu Alt Kategori */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alt Kategori
                  </label>
                  <select
                    value={bulkSubcategoryId}
                    onChange={(e) => setBulkSubcategoryId(e.target.value)}
                    className="w-full px-2 py-2 border rounded text-sm"
                    disabled={!bulkCategoryId || processing}
                  >
                    <option value="">-</option>
                    {bulkCategory?.subcategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toplu Marka */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Marka
                  </label>
                  <select
                    value={bulkBrandId}
                    onChange={(e) => setBulkBrandId(e.target.value)}
                    className="w-full px-2 py-2 border rounded text-sm"
                    disabled={processing || !canEditAllBrands}
                  >
                    <option value="">-</option>
                    {availableBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toplu Beden */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Beden
                  </label>
                  <select
                    value={bulkSizeRange}
                    onChange={(e) => setBulkSizeRange(e.target.value)}
                    className="w-full px-2 py-2 border rounded text-sm"
                    disabled={processing}
                  >
                    <option value="">-</option>
                    <option value="36-42">36-42</option>
                    <option value="42-48">42-48</option>
                    <option value="S-XL">S-XL</option>
                    <option value="M-XXL">M-XXL</option>
                    <option value="XS-L">XS-L</option>
                  </select>
                </div>

                {/* Toplu Fiyat */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fiyat
                  </label>
                  <input
                    type="text"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="Örn: 145"
                    className="w-full px-2 py-2 border rounded text-sm"
                    disabled={processing}
                  />
                </div>
              </div>

              {/* Hızlı fiyat butonları + Uygula */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1.5 flex-wrap">
                  {[10, 20, 30, 50, 100, 150, 200].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBulkPrice(`${value}`)}
                      disabled={processing}
                      className={`px-2.5 py-1 text-xs border rounded transition-colors ${
                        bulkPrice === `${value}`
                          ? "bg-black text-white border-black"
                          : "border-gray-300 hover:bg-gray-100"
                      } disabled:opacity-50`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <button
                  onClick={applyBulkToAll}
                  disabled={
                    processing ||
                    (!bulkCategoryId &&
                      !bulkBrandId &&
                      !bulkSizeRange &&
                      !bulkPrice)
                  }
                  className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Tümüne Uygula
                </button>
              </div>
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
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-sm font-medium">
                            Ürün Kodu *
                          </label>
                          {product.mode === "update" ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Mevcut Ürün - Fotoğraf Güncellenecek
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Yeni Ürün
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={product.folderName}
                          readOnly
                          className="w-full px-3 py-2 border rounded bg-gray-50"
                        />
                        {product.mode === "update" && (
                          <p className="mt-1 text-xs text-blue-600">
                            Bu ürün kodu sistemde mevcut (
                            {product.existingImageCount || 0} görsel).
                            Fotoğraflar güncellenecek.
                          </p>
                        )}
                      </div>

                      {/* Kategori - sadece yeni ürünlerde göster */}
                      {product.mode === "create" && (
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
                      )}

                      {/* Alt Kategori - sadece yeni ürünlerde */}
                      {product.mode === "create" && (
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
                      )}

                      {/* Marka - sadece yeni ürünlerde */}
                      {product.mode === "create" && (
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
                      )}

                      {/* Beden Aralığı - sadece yeni ürünlerde */}
                      {product.mode === "create" && (
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
                      )}

                      {/* Fiyat - sadece yeni ürünlerde */}
                      {product.mode === "create" && (
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
                      )}

                      {/* Durum - sadece yeni ürünlerde */}
                      {product.mode === "create" && (
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
                              product.uploadStatus !== "waiting" ||
                              !canEditStatus
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Alt Butonlar */}
            <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border space-y-3">
              {/* Progress Bar */}
              {processing && uploadProgress.total > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      Yukleniyor... {uploadProgress.current}/
                      {uploadProgress.total} urun
                    </span>
                    <span>
                      %
                      {Math.round(
                        (uploadProgress.current / uploadProgress.total) * 100,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-black h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => setProducts([])}
                  disabled={processing}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Iptal Et
                </button>
                <button
                  onClick={handleSubmitAll}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Upload className="w-5 h-5 animate-spin" />
                      Yukleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Tumunu Kaydet ({products.length} Urun)
                    </>
                  )}
                </button>
              </div>
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
