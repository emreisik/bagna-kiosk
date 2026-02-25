import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import {
  Save,
  Upload,
  Loader2,
  Settings,
  Monitor,
  X,
  Clock,
  Timer,
  Grid3x3,
  RefreshCw,
} from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUrl";

type TabType = "general" | "product-display" | "attract-mode";

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [settings, setSettings] = useState({
    site_logo: "",
    screensaver_logo: "",
    site_name: "Kiosk QR",
    currency: "$",
    notification_email: "",
    grid_columns_mobile: 2,
    grid_columns_tablet: 2,
    grid_columns_desktop: 3,
    grid_columns_kiosk: 3,
    show_product_info_on_cards: false,
    product_info_position: "below" as "overlay" | "below",
    logo_width: 144,
    slideshow_images: [] as string[],
    slideshow_interval: 4000,
    idle_timeout: 30000,
    slideshow_transition: "fade",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const token = localStorage.getItem("adminToken") || "";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.adminGetSettings(token);
      const settingsObj: any = {};
      data.forEach((s: any) => {
        settingsObj[s.key] = s.value;
      });
      setSettings({
        site_logo: settingsObj.site_logo || "",
        screensaver_logo: settingsObj.screensaver_logo || "",
        site_name: settingsObj.site_name || "Kiosk QR",
        currency: settingsObj.currency || "$",
        notification_email: settingsObj.notification_email || "",
        grid_columns_mobile: settingsObj.grid_columns_mobile
          ? parseInt(settingsObj.grid_columns_mobile)
          : 2,
        grid_columns_tablet: settingsObj.grid_columns_tablet
          ? parseInt(settingsObj.grid_columns_tablet)
          : 2,
        grid_columns_desktop: settingsObj.grid_columns_desktop
          ? parseInt(settingsObj.grid_columns_desktop)
          : 3,
        grid_columns_kiosk: settingsObj.grid_columns_kiosk
          ? parseInt(settingsObj.grid_columns_kiosk)
          : 3,
        show_product_info_on_cards:
          settingsObj.show_product_info_on_cards === "true",
        product_info_position: (settingsObj.product_info_position ||
          "below") as "overlay" | "below",
        logo_width: settingsObj.logo_width
          ? parseInt(settingsObj.logo_width)
          : 144,
        slideshow_images: settingsObj.slideshow_images
          ? JSON.parse(settingsObj.slideshow_images)
          : [],
        slideshow_interval: settingsObj.slideshow_interval
          ? parseInt(settingsObj.slideshow_interval)
          : 4000,
        idle_timeout: settingsObj.idle_timeout
          ? parseInt(settingsObj.idle_timeout)
          : 30000,
        slideshow_transition: settingsObj.slideshow_transition || "fade",
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "site_logo" | "screensaver_logo",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file, token);
      setSettings({ ...settings, [type]: result.url });
      alert("Logo yüklendi");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      alert("Logo yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const handleSlideshowImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadMultipleImages(files, token);
      const newImages = result.images.map((img: any) => img.url);
      setSettings({
        ...settings,
        slideshow_images: [...settings.slideshow_images, ...newImages],
      });
      alert(`${files.length} görsel yüklendi`);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Görseller yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSlideshowImage = (index: number) => {
    setSettings({
      ...settings,
      slideshow_images: settings.slideshow_images.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiClient.adminUpsertSetting(
        "site_logo",
        settings.site_logo,
        token,
      );
      await apiClient.adminUpsertSetting(
        "screensaver_logo",
        settings.screensaver_logo,
        token,
      );
      await apiClient.adminUpsertSetting(
        "site_name",
        settings.site_name,
        token,
      );
      await apiClient.adminUpsertSetting("currency", settings.currency, token);
      await apiClient.adminUpsertSetting(
        "grid_columns_mobile",
        settings.grid_columns_mobile.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "grid_columns_tablet",
        settings.grid_columns_tablet.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "grid_columns_desktop",
        settings.grid_columns_desktop.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "grid_columns_kiosk",
        settings.grid_columns_kiosk.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "show_product_info_on_cards",
        settings.show_product_info_on_cards.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "product_info_position",
        settings.product_info_position,
        token,
      );
      await apiClient.adminUpsertSetting(
        "slideshow_images",
        JSON.stringify(settings.slideshow_images),
        token,
      );
      await apiClient.adminUpsertSetting(
        "slideshow_interval",
        settings.slideshow_interval.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "idle_timeout",
        settings.idle_timeout.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "slideshow_transition",
        settings.slideshow_transition,
        token,
      );
      await apiClient.adminUpsertSetting(
        "logo_width",
        settings.logo_width.toString(),
        token,
      );
      await apiClient.adminUpsertSetting(
        "notification_email",
        settings.notification_email,
        token,
      );

      // Invalidate settings cache to refresh all settings across the app
      await queryClient.invalidateQueries({ queryKey: ["settings"] });

      alert("Ayarlar kaydedildi!");
    } catch (error) {
      alert("Kaydetme işlemi başarısız oldu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Tüm kiosk ekranları yeniden yüklenecektir. Devam etmek istiyor musunuz?",
      )
    ) {
      return;
    }

    setClearingCache(true);
    try {
      await apiClient.adminClearCache(token);
      alert(
        "Cache temizlendi! Kiosk ekranları otomatik olarak yenilenecektir.",
      );
    } catch (error) {
      console.error("Clear cache error:", error);
      alert("Cache temizlenemedi. Lütfen tekrar deneyin.");
    } finally {
      setClearingCache(false);
    }
  };

  const tabs = [
    { id: "general" as TabType, label: "Genel", icon: Settings },
    {
      id: "product-display" as TabType,
      label: "Ürün Görünümü",
      icon: Grid3x3,
    },
    { id: "attract-mode" as TabType, label: "Ekran Koruyucu", icon: Monitor },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Ayarları</h1>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Site Name Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Site Adı
                </h3>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) =>
                    setSettings({ ...settings, site_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Kiosk QR"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Logo yoksa bu metin görsel olarak gösterilir
                </p>
              </div>

              {/* Currency Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Para Birimi
                </h3>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="$">Dolar ($)</option>
                  <option value="€">Euro (€)</option>
                  <option value="₺">Türk Lirası (₺)</option>
                  <option value="£">Sterlin (£)</option>
                  <option value="¥">Yen (¥)</option>
                  <option value="₽">Ruble (₽)</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Tüm ürün fiyatlarının yanında bu para birimi gösterilecektir
                </p>
              </div>

              {/* Bildirim E-postalari Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Bildirim E-postalari
                </h3>
                <input
                  type="text"
                  value={settings.notification_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notification_email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="ornek@mail.com, ornek2@mail.com"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Yeni siparis geldiginde bu adreslere bildirim gonderilir.
                  Birden fazla icin virgul ile ayirin.
                </p>
              </div>

              {/* Header Logo Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Header Logosu
                </h3>

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
                          Logo Yükle
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "site_logo")}
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
                      value={settings.site_logo}
                      onChange={(e) =>
                        setSettings({ ...settings, site_logo: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Logo Width */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Logo Genişliği (px):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={40}
                        max={400}
                        step={4}
                        value={settings.logo_width}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            logo_width: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <input
                        type="number"
                        min={40}
                        max={400}
                        value={settings.logo_width}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            logo_width: parseInt(e.target.value) || 144,
                          })
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {settings.site_logo && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-3">
                        Önizleme:
                      </p>
                      <div className="bg-white p-3 rounded-lg flex items-center justify-center">
                        <img
                          src={settings.site_logo}
                          alt="Header Logo"
                          style={{ width: settings.logo_width }}
                          className="h-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cache Temizle Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Kiosk Ekranlarını Yenile
                </h3>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Mağazadaki kiosk ekranlarını uzaktan yenilemek için bu
                    butonu kullanın. Tüm ekranlar otomatik olarak
                    yenilenecektir.
                  </p>

                  <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {clearingCache ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Temizleniyor...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Cache Temizle ve Yenile</span>
                      </>
                    )}
                  </button>

                  <div className="mt-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800">
                      <strong>Not:</strong> Bu işlem tüm kiosk ekranlarının
                      yeniden yüklenmesine neden olur. Yoğun saatlerde
                      kullanmaktan kaçının.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Display Settings Tab */}
          {activeTab === "product-display" && (
            <div className="space-y-6">
              {/* Grid Columns Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Galeri Sütun Sayısı (Cihaz Bazlı)
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Mobile (&lt; 768px)
                    </label>
                    <select
                      value={settings.grid_columns_mobile}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          grid_columns_mobile: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Tablet */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Tablet (768-1024px)
                    </label>
                    <select
                      value={settings.grid_columns_tablet}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          grid_columns_tablet: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Desktop */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Desktop (1024-1440px)
                    </label>
                    <select
                      value={settings.grid_columns_desktop}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          grid_columns_desktop: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Kiosk */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Kiosk (&gt;= 1440px)
                    </label>
                    <select
                      value={settings.grid_columns_kiosk}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          grid_columns_kiosk: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Her cihaz tipi için ayrı sütun sayısı belirleyebilirsiniz.
                  Breakpoint'ler: Mobile (&lt;768px), Tablet (768-1024px),
                  Desktop (1024-1440px), Kiosk (≥1440px)
                </p>
              </div>

              {/* Kart Üzerinde Ürün Bilgisi */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Kart Üzerinde Ürün Bilgisi
                </h3>

                <div className="space-y-4">
                  {/* Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.show_product_info_on_cards}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          show_product_info_on_cards: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">
                        Ürün kartlarında bilgi göster
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ürün kodu, fiyat ve beden bilgilerini kartların
                        üzerinde/altında minimal olarak gösterir
                      </p>
                    </div>
                  </label>

                  {/* Position Selector */}
                  {settings.show_product_info_on_cards && (
                    <div className="mt-4 pl-8 border-l-2 border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Bilgi Pozisyonu
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="product_info_position"
                            value="below"
                            checked={settings.product_info_position === "below"}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                product_info_position: e.target.value as
                                  | "overlay"
                                  | "below",
                              })
                            }
                            className="w-4 h-4 text-black border-gray-300 focus:ring-2 focus:ring-black cursor-pointer"
                          />
                          <div>
                            <span className="text-sm text-gray-900 group-hover:text-black transition-colors">
                              Görsel Altında
                            </span>
                            <p className="text-xs text-gray-500">
                              Bilgiler görselin altında gösterilir
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="product_info_position"
                            value="overlay"
                            checked={
                              settings.product_info_position === "overlay"
                            }
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                product_info_position: e.target.value as
                                  | "overlay"
                                  | "below",
                              })
                            }
                            className="w-4 h-4 text-black border-gray-300 focus:ring-2 focus:ring-black cursor-pointer"
                          />
                          <div>
                            <span className="text-sm text-gray-900 group-hover:text-black transition-colors">
                              Görsel Üzerinde
                            </span>
                            <p className="text-xs text-gray-500">
                              Bilgiler görselin alt kısmında gradient ile
                              gösterilir
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attract Mode Settings Tab */}
          {activeTab === "attract-mode" && (
            <div className="space-y-6">
              {/* Timing Settings Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Zamanlama Ayarları
                </h3>

                <div className="grid grid-cols-3 gap-6">
                  {/* Idle Timeout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ekran Koruyucu Süresi
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.idle_timeout / 1000}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            idle_timeout: parseInt(e.target.value) * 1000,
                          })
                        }
                        className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        min="5"
                        max="300"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        saniye
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Kullanıcı bu süre hareketsiz kalırsa ekran koruyucu başlar
                    </p>
                  </div>

                  {/* Slideshow Interval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görsel Geçiş Süresi
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.slideshow_interval / 1000}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            slideshow_interval: parseInt(e.target.value) * 1000,
                          })
                        }
                        className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        min="1"
                        max="30"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        saniye
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Slideshow görselleri bu aralıkta değişir
                    </p>
                  </div>

                  {/* Transition Effect */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geçiş Efekti
                    </label>
                    <select
                      value={settings.slideshow_transition}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          slideshow_transition: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    >
                      <option value="fade">Fade (Yumuşak Geçiş)</option>
                      <option value="slide">Slide (Kaydırma)</option>
                      <option value="zoom">Zoom (Yakınlaşma)</option>
                      <option value="flip">Flip (Çevirme)</option>
                      <option value="kenburns">Ken Burns (Zoom+Pan)</option>
                    </select>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Görseller arası geçiş animasyonu
                    </p>
                  </div>
                </div>
              </div>

              {/* Screensaver Logo Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Ekran Koruyucu Logosu
                </h3>

                <div className="space-y-4">
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
                          Logo Yükle
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "screensaver_logo")}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      veya URL girin:
                    </label>
                    <input
                      type="url"
                      value={settings.screensaver_logo}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          screensaver_logo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
                      placeholder="https://example.com/screensaver-logo.png"
                    />
                  </div>

                  {settings.screensaver_logo && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <p className="text-xs font-medium text-white mb-3">
                        Önizleme (Karanlık Arkaplan):
                      </p>
                      <div className="bg-black/50 p-6 rounded-lg flex items-center justify-center min-h-[120px]">
                        <img
                          src={normalizeImageUrl(settings.screensaver_logo)}
                          alt="Screensaver Logo"
                          className="max-h-20 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Slideshow Images Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Slideshow Görselleri
                </h3>

                <div className="space-y-4">
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
                          Görselleri Yükle
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSlideshowImagesUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {/* Images Grid */}
                  {settings.slideshow_images.length > 0 ? (
                    <>
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {settings.slideshow_images.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <img
                              src={normalizeImageUrl(imageUrl)}
                              alt={`Slideshow ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveSlideshowImage(index)}
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>{settings.slideshow_images.length}</strong>{" "}
                          görsel yüklendi
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">
                        Henüz görsel yüklenmedi
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Yukarıdaki butonu kullanarak ekleyin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
