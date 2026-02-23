import { useState, useEffect } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { normalizeImageUrl } from "../../utils/imageUrl";

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logo: "" });
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem("adminToken") || "";

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await apiClient.adminGetBrands(token);
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file, token);
      setFormData({ ...formData, logo: result.url });
      alert("Logo yüklendi!");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      alert("Logo yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const getFullUrl = (path: string) => {
    const normalized = normalizeImageUrl(path);
    if (!normalized) return "";
    return normalized.startsWith("http")
      ? normalized
      : `${window.location.origin}${normalized}`;
  };

  const handleCopyUrl = async () => {
    if (!formData.logo) return;

    try {
      await navigator.clipboard.writeText(getFullUrl(formData.logo));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Kopyalama başarısız oldu");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await apiClient.adminUpdateBrand(editingBrand.id, formData, token);
      } else {
        await apiClient.adminCreateBrand(formData, token);
      }
      setIsModalOpen(false);
      setFormData({ name: "", logo: "" });
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      alert("İşlem başarısız oldu");
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, logo: brand.logo || "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu markayı silmek istediğinizden emin misiniz?")) return;
    try {
      await apiClient.adminDeleteBrand(id, token);
      fetchBrands();
    } catch (error) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", logo: "" });
    setEditingBrand(null);
    setCopied(false);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Markalar</h1>
          <button
            onClick={() => {
              setEditingBrand(null);
              setFormData({ name: "", logo: "" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Yeni Marka
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Henüz marka eklenmemiş</p>
            <p className="text-gray-400 text-sm mt-2">
              Başlamak için "Yeni Marka" butonuna tıklayın
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {brand.logo ? (
                  <div className="w-full h-32 mb-4 bg-gray-50 rounded-lg flex items-center justify-center p-4">
                    <img
                      src={normalizeImageUrl(brand.logo)}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Logo yok</span>
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {brand.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {brand._count?.products || 0} ürün
                </p>

                {/* Logo URL with Copy */}
                {brand.logo && (
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Logo URL:</p>
                        <p className="text-xs text-gray-700 font-mono truncate">
                          {brand.logo}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(brand.logo);
                            alert("URL kopyalandı!");
                          } catch (error) {
                            alert("Kopyalama başarısız oldu");
                          }
                        }}
                        className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="URL'yi kopyala"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingBrand ? "Marka Düzenle" : "Yeni Marka"}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            {/* Marka Adı */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Örn: Nike, Adidas, Puma"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Logo
              </label>

              <div className="space-y-4">
                {/* Upload Button */}
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all group">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">
                        Yükleniyor...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                        Dosyadan Yükle
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                {/* URL Input */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    veya URL girin:
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({ ...formData, logo: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                  />
                </div>

                {/* Preview */}
                {formData.logo && (
                  <div className="relative mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs font-medium text-gray-600 mb-3">
                      Önizleme:
                    </p>
                    <div className="bg-white p-4 rounded-lg flex items-center justify-center min-h-[120px] mb-3">
                      <img
                        src={normalizeImageUrl(formData.logo)}
                        alt="Logo preview"
                        className="max-h-24 object-contain"
                      />
                    </div>

                    {/* URL Display with Copy Button */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        Logo URL:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={getFullUrl(formData.logo)}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                          title="URL'yi kopyala"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Kopyalandı
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span className="text-xs text-gray-700 font-medium">
                                Kopyala
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <ModalFooter>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {editingBrand ? "Güncelle" : "Oluştur"}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
