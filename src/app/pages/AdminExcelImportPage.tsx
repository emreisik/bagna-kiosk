import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import {
  ArrowLeft,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  NotificationModal,
  NotificationType,
} from "../components/admin/NotificationModal";

interface ParsedProduct {
  productCode: string;
  productName: string;
  price: number;
  colors: string[];
  sizes: string[];
  barcodes: string[];
  categoryGuess: string;
}

// Turkce karakterleri ASCII'ye normalize et (İ→i, Ş→s, Ü→u, vb.)
function normalizeTurkish(str: string): string {
  return str
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Beden listesinden toptan format (36-42)
function formatSizeRange(sizes: string[]): string {
  const nums = sizes.filter((s) => !isNaN(Number(s))).map(Number);
  if (nums.length > 0) {
    return `${Math.min(...nums)}-${Math.max(...nums)}`;
  }
  return sizes.join("-");
}

// Urun adina gore kategori tahmini
function guessCategory(productName: string): string {
  const normalized = normalizeTurkish(productName);
  if (normalized.includes("pantolonlu takim")) return "Pantolonlu Takim";
  if (normalized.includes("yelekli takim")) return "Yelekli Takim";
  if (normalized.includes("denim pantolon")) return "Denim Pantolon";
  if (normalized.includes("ceket")) return "Ceket";
  if (normalized.includes("yelek")) return "Yelek";
  if (normalized.includes("gomlek")) return "Gomlek";
  if (normalized.includes("bluz")) return "Bluz";
  if (normalized.includes("tisort")) return "Tisort";
  if (normalized.includes("triko")) return "Triko";
  if (normalized.includes("pantolon")) return "Pantolon";
  if (normalized.includes("etek")) return "Etek";
  if (normalized.includes("sort")) return "Sort";
  if (normalized.includes("tayt")) return "Tayt";
  if (normalized.includes("elbise")) return "Elbise";
  return "Diger";
}

// CSV satirini parse et (quoted alanlari destekler)
function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++; // escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

// Delimiter otomatik tespit (virgul veya noktali virgul)
function detectDelimiter(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

// CSV dosyasini browser'da parse et (harici kutuphane gerekmez)
function parseCsvFile(file: File): Promise<ParsedProduct[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          reject(new Error("CSV dosyasi bos veya gecersiz"));
          return;
        }

        const delimiter = detectDelimiter(lines[0]);
        // BOM karakterini temizle + Turkce normalize et
        const rawHeaders = parseCsvLine(
          lines[0].replace(/^\uFEFF/, ""),
          delimiter,
        );
        const headers = rawHeaders.map((h) => normalizeTurkish(h.trim()));

        // Sutun indekslerini bul (normalize edilmis headerlar)
        const colMap = {
          productCode: headers.findIndex(
            (h) => h.includes("urun kodu") || h.includes("product code"),
          ),
          productName: headers.findIndex(
            (h) => h.includes("urun adi") || h.includes("product name"),
          ),
          colorCode: headers.findIndex(
            (h) => h.includes("renk kodu") || h.includes("color code"),
          ),
          colorName: headers.findIndex(
            (h) => h.includes("renk aciklamasi") || h.includes("color"),
          ),
          size: headers.findIndex(
            (h) => h.includes("beden") || h.includes("size"),
          ),
          barcode: headers.findIndex(
            (h) => h.includes("barkod") || h.includes("barcode"),
          ),
          price: headers.findIndex(
            (h) => h.includes("fiyat") || h.includes("price"),
          ),
        };

        // Urunleri grupla (urun koduna gore)
        const productMap = new Map<string, ParsedProduct>();

        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i], delimiter);
          if (!row || row.length === 0) continue;

          const code = (row[colMap.productCode] || "").trim();
          if (!code) continue;

          if (!productMap.has(code)) {
            const name = (row[colMap.productName] || "").trim();
            productMap.set(code, {
              productCode: code,
              productName: name,
              price: Number((row[colMap.price] || "").replace(",", ".")) || 0,
              colors: [],
              sizes: [],
              barcodes: [],
              categoryGuess: guessCategory(name),
            });
          }

          const product = productMap.get(code)!;

          // Renk ekle (tekrarsiz)
          const colorName = (row[colMap.colorName] || "").trim();
          if (colorName && !product.colors.includes(colorName)) {
            product.colors.push(colorName);
          }

          // Beden ekle (tekrarsiz)
          const size = (row[colMap.size] || "").trim();
          if (size && !product.sizes.includes(size)) {
            product.sizes.push(size);
          }

          // Barkod ekle
          const barcode = (row[colMap.barcode] || "").trim();
          if (barcode) {
            product.barcodes.push(barcode);
          }
        }

        resolve(Array.from(productMap.values()));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Dosya okunamadi"));
    reader.readAsText(file, "UTF-8");
  });
}

export function AdminExcelImportPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");

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
  const canEditAllBrands = isSuperAdmin || userBrandIds.length === 0;
  const availableBrands = canEditAllBrands
    ? brands
    : brands.filter((b: any) => userBrandIds.includes(b.id));

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await apiClient.adminGetBrands(token);
      setBrands(data);
      // Tek marka varsa otomatik sec
      if (!canEditAllBrands && data.length === 1) {
        setSelectedBrandId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setParsing(true);
      setFileName(file.name);

      try {
        const parsed = await parseCsvFile(file);
        setProducts(parsed);
      } catch (error: any) {
        setNotificationModal({
          isOpen: true,
          type: "error",
          title: "Parse Hatasi",
          message: error.message || "CSV dosyasi okunamadi",
          details: [],
        });
      } finally {
        setParsing(false);
      }
    },
    [],
  );

  const handleImport = async () => {
    if (products.length === 0) return;

    if (!selectedBrandId) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Marka Secilmedi",
        message: "Lutfen urunler icin bir marka secin.",
        details: [],
      });
      return;
    }

    setImporting(true);

    try {
      const result = await apiClient.adminBulkImport(
        {
          products: products.map((p) => ({
            productCode: p.productCode,
            productName: p.productName,
            price: p.price,
            colors: p.colors,
            sizes: p.sizes,
            barcodes: p.barcodes,
          })),
          brandId: selectedBrandId,
          status: isSuperAdmin ? "approved" : undefined,
        },
        token,
      );

      setNotificationModal({
        isOpen: true,
        type: result.created > 0 ? "success" : "warning",
        title: result.created > 0 ? "Import Basarili!" : "Import Sonucu",
        message: `${result.created} urun olusturuldu, ${result.skipped} atlandi.`,
        details: result.errors || [],
      });

      if (result.created > 0) {
        setTimeout(() => {
          navigate("/admin/products");
        }, 3000);
      }
    } catch (error: any) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Import Hatasi",
        message: error.message || "Import sirasinda hata olustu",
        details: [],
      });
    } finally {
      setImporting(false);
    }
  };

  // Kategori bazli gruplama
  const categoryGroups = products.reduce(
    (acc, p) => {
      const cat = p.categoryGuess;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    },
    {} as Record<string, ParsedProduct[]>,
  );

  const totalVariants = products.reduce(
    (sum, p) => sum + p.colors.length * p.sizes.length,
    0,
  );

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
            Urunlere Don
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            CSV'den Urun Aktar
          </h1>
          <p className="text-gray-600 mt-2">
            Barkodlu urun listesini (CSV) yukleyerek toplu urun olusturun
          </p>
        </div>

        {/* Dosya Secimi */}
        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              {parsing ? (
                <>
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    CSV Okunuyor...
                  </h3>
                  <p className="text-sm text-gray-600">{fileName}</p>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    CSV Dosyasi Secin
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Barkodlu urun listesini (.csv) yukleyin
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                    Beklenen sutunlar: Urun Kodu, Urun Adi, Renk Kodu, Renk
                    Aciklamasi, Beden, Barkod, Fiyat
                  </p>
                  <label className="inline-block cursor-pointer bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    Dosya Sec
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Onizleme */}
        {products.length > 0 && (
          <div className="space-y-4">
            {/* Ozet Bilgi */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  CSV Basariyla Okundu
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm text-green-700">
                <div>
                  <span className="font-medium">{products.length}</span>{" "}
                  benzersiz urun
                </div>
                <div>
                  <span className="font-medium">
                    {new Set(products.flatMap((p) => p.colors)).size}
                  </span>{" "}
                  farkli renk
                </div>
                <div>
                  <span className="font-medium">{totalVariants}</span> toplam
                  SKU/varyant
                </div>
                <div>
                  <span className="font-medium">
                    {Math.min(...products.map((p) => p.price))} -{" "}
                    {Math.max(...products.map((p) => p.price))}$
                  </span>{" "}
                  fiyat araligi
                </div>
              </div>
            </div>

            {/* Marka Secimi */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Import Ayarlari
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marka *
                  </label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    disabled={importing || !canEditAllBrands}
                  >
                    <option value="">Marka Secin</option>
                    {availableBrands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Kategoriler otomatik tespit edilecek. Fotograflar daha sonra
                    toplu yukleme ile eklenebilir.
                  </div>
                </div>
              </div>
            </div>

            {/* Kategori Bazli Urun Listesi */}
            {Object.entries(categoryGroups).map(([category, prods]) => (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="px-5 py-3 bg-gray-50 border-b rounded-t-lg flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {category}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({prods.length} urun)
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          Urun Kodu
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          Urun Adi
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          Renkler
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          Bedenler
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">
                          Fiyat
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-gray-600">
                          SKU
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prods.map((product) => (
                        <tr
                          key={product.productCode}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs">
                            {product.productCode}
                          </td>
                          <td className="px-4 py-2.5">
                            {product.productName
                              .split(" - ")
                              .slice(1)
                              .join(" - ") || product.productName}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {product.colors.map((color) => (
                                <span
                                  key={color}
                                  className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-600">
                            {formatSizeRange(product.sizes)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium">
                            {product.price}$
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-500">
                            {product.colors.length * product.sizes.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Alt Butonlar */}
            <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
              <button
                onClick={() => {
                  setProducts([]);
                  setFileName("");
                }}
                disabled={importing}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Iptal Et
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !selectedBrandId}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Import Ediliyor...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    {products.length} Urunu Import Et
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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
