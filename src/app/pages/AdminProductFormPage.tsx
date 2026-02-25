import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/admin/AdminLayout";
import { useCategories } from "../../hooks/useCategories";
import { apiClient } from "../../services/api";
import { X, ArrowLeft, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUrl";

export function AdminProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();

  const { data: categoriesData } = useCategories();
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userBrandIds, setUserBrandIds] = useState<string[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    productCode: "",
    shortDesc: "",
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    sizeRange: "",
    price: "",
    status: "pending", // "pending", "approved", "rejected"
  });
  const [productImages, setProductImages] = useState<string[]>([]); // İlk görsel = ana görsel, diğerleri = galeri
  const [variants, setVariants] = useState<
    Array<{ sizeRange: string; color: string; price: string }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const token = localStorage.getItem("adminToken") || "";
  const categories = categoriesData || [];
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // User role & brands
  const adminUserStr = localStorage.getItem("adminUser");
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

  // availableBrands tanımını burada yap (useEffect'ten önce)
  // Super admin veya brand atanmamış adminler tüm markaları görebilir
  const canEditAllBrands = isSuperAdmin || userBrandIds.length === 0;
  const availableBrands = canEditAllBrands
    ? brands
    : brands.filter((b) => userBrandIds.includes(b.id));

  // Brand-admin requiresApproval=true ise status değiştiremez
  const canEditStatus = isSuperAdmin || !requiresApproval;

  useEffect(() => {
    if (adminUser) {
      setIsSuperAdmin(adminUser.role === "super_admin");
      setUserBrandIds(adminUser.brands?.map((b: any) => b.brandId) || []);
      setRequiresApproval(adminUser.requiresApproval ?? true);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  // Brand admin için tek markası varsa otomatik seç
  useEffect(() => {
    if (
      !canEditAllBrands &&
      availableBrands.length === 1 &&
      !formData.brandId
    ) {
      setFormData({ ...formData, brandId: availableBrands[0].id });
    }
  }, [availableBrands, canEditAllBrands]);

  const fetchBrands = async () => {
    try {
      const data = await apiClient.adminGetBrands(token);
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await apiClient.adminGetProducts(token);
      const product = data.products.find((p: any) => p.id === id);
      if (product) {
        console.log("🔍 Loaded product:", product);
        console.log("🖼️ Product images:", product.images);
        console.log("🖼️ Product imageUrl:", product.imageUrl);

        setFormData({
          title: product.title,
          productCode: product.productCode,
          shortDesc: product.shortDesc,
          brandId: product.brandId || "",
          categoryId: product.categoryId || "",
          subcategoryId: product.subcategoryId || "",
          sizeRange: product.sizeRange,
          price: product.price,
          status: product.status || "pending",
        });

        // product.images zaten ana görsel + diğer görselleri içeriyor
        setProductImages(product.images || []);

        // Varyantlari yukle
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v: any) => ({
              sizeRange: v.sizeRange,
              color: v.color,
              price: v.price,
            })),
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      alert("Ürün yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const result = await apiClient.uploadMultipleImages(files, token);
      const newUrls = result.images.map((img) => img.url);
      setProductImages([...productImages, ...newUrls]);
      alert(`${files.length} görsel başarıyla yüklendi`);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Görseller yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    await handleImageUpload(files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      alert("Sadece resim dosyaları yükleyebilirsiniz");
      return;
    }

    await handleImageUpload(files);
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...productImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setProductImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productImages.length === 0) {
      alert("En az bir ürün görseli eklemelisiniz");
      return;
    }

    setIsLoading(true);

    try {
      // Otomatik title oluştur: productCode varsa onu kullan, yoksa otomatik ID
      const autoTitle =
        formData.productCode || `Ürün-${Date.now().toString().slice(-6)}`;

      const productData = {
        title: autoTitle,
        productCode: formData.productCode,
        shortDesc: autoTitle, // title ile aynı
        mainImageUrl: productImages[0], // İlk görsel ana görsel
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        brandId: formData.brandId || undefined,
        sizeRange: formData.sizeRange,
        price: formData.price,
        status: formData.status,
        images: productImages.slice(1).map((imageUrl, index) => ({
          imageUrl,
          displayOrder: index,
        })),
        variants: variants.length > 0 ? variants : undefined,
      };

      console.log("📦 Product data being sent:", productData);
      console.log("✅ Status value:", formData.status);

      if (isEditing && id) {
        await apiClient.adminUpdateProduct(id, productData, token);
        alert("Ürün güncellendi");
      } else {
        await apiClient.adminCreateProduct(productData, token);
        alert("Ürün oluşturuldu");
      }

      // Invalidate products cache to refresh all product lists
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("İşlem başarısız oldu");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
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
            {isEditing ? "Ürün Düzenle" : "Yeni Ürün"}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Görseller - Üstte Horizontal */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold">Ürün Görselleri</h4>
                  <p className="text-xs text-gray-500">
                    {productImages.length} görsel yüklendi
                  </p>
                </div>

                {/* Upload Button */}
                <label
                  className={`border-2 border-dashed rounded transition-colors cursor-pointer flex items-center gap-2 px-4 py-2 ${
                    isDragging
                      ? "border-black bg-gray-100"
                      : "border-gray-300 hover:border-gray-400"
                  } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      <span className="text-sm text-gray-600">
                        Yükleniyor...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Görsel Yükle
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Horizontal Preview */}
              {productImages.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {productImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group flex-shrink-0 w-24 h-24 rounded overflow-hidden border-2"
                      style={{
                        borderColor: idx === 0 ? "#000" : "#e5e7eb",
                      }}
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-black text-white text-[9px] px-1 py-0.5 text-center z-10">
                          Ana Görsel
                        </div>
                      )}
                      <img
                        src={normalizeImageUrl(url)}
                        alt={`Görsel ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="bg-red-500 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Sil"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Alanları - Full Width */}
            <div className="grid grid-cols-3 gap-4">
              {/* Ürün Kodu - Full Width */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">
                  Ürün Kodu *
                </label>
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) =>
                    setFormData({ ...formData, productCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Örn: BGN2001"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      subcategoryId: "",
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName}
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
                  value={formData.subcategoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subcategoryId: e.target.value,
                    })
                  }
                  disabled={!formData.categoryId}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  {selectedCategory?.subcategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marka */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Marka *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) =>
                    setFormData({ ...formData, brandId: e.target.value })
                  }
                  required
                  disabled={!canEditAllBrands}
                  className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                >
                  {canEditAllBrands && <option value="">Seçiniz</option>}
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
                  value={formData.sizeRange}
                  onChange={(e) =>
                    setFormData({ ...formData, sizeRange: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded"
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
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Örn: 145$"
                />
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Durum *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                  disabled={!canEditStatus}
                  className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
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

              {/* Fiyat Hızlı Seçim - Full Width */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-2">
                  Hızlı Fiyat Seçimi
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[10, 20, 30, 50, 100, 150, 200].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, price: `${value}` })
                      }
                      className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Varyantlar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold">
                    Varyantlar (Opsiyonel)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Birden fazla beden/renk/fiyat kombinasyonu ekleyin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVariants([
                      ...variants,
                      {
                        sizeRange: formData.sizeRange || "36-42",
                        color: "",
                        price: formData.price || "",
                      },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Varyant Ekle
                </button>
              </div>

              {variants.length > 0 && (
                <div className="space-y-2">
                  {/* Tablo basligi */}
                  <div className="grid grid-cols-12 gap-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="col-span-4">Beden Araligi</span>
                    <span className="col-span-4">Renk</span>
                    <span className="col-span-3">Fiyat</span>
                    <span className="col-span-1"></span>
                  </div>

                  {variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2"
                    >
                      <div className="col-span-4">
                        <select
                          value={variant.sizeRange}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx] = {
                              ...updated[idx],
                              sizeRange: e.target.value,
                            };
                            setVariants(updated);
                          }}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          <option value="36-42">36-42</option>
                          <option value="42-48">42-48</option>
                          <option value="32-40">32-40</option>
                          <option value="42-46">42-46</option>
                          <option value="S-XL">S-XL</option>
                          <option value="M-XXL">M-XXL</option>
                          <option value="XS-L">XS-L</option>
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx] = {
                              ...updated[idx],
                              color: e.target.value,
                            };
                            setVariants(updated);
                          }}
                          placeholder="Orn: Siyah"
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={variant.price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx] = {
                              ...updated[idx],
                              price: e.target.value,
                            };
                            setVariants(updated);
                          }}
                          placeholder="Orn: 145$"
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setVariants(variants.filter((_, i) => i !== idx))
                          }
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    İşleniyor...
                  </>
                ) : isEditing ? (
                  "Güncelle"
                ) : (
                  "Oluştur"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
