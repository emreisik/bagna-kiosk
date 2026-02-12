import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/admin/AdminLayout";
import {
  translations as defaultTranslations,
  Language,
} from "../../i18n/translations";
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
} from "lucide-react";

interface TranslationData {
  [key: string]: {
    [lang: string]: string;
  };
}

export function AdminTranslationsPage() {
  const navigate = useNavigate();
  const [translationData, setTranslationData] = useState<TranslationData>({});
  const [languages, setLanguages] = useState<Language[]>(["en", "tr", "ru"]);
  const [activeLanguages, setActiveLanguages] = useState<Set<Language>>(
    new Set(["en", "tr", "ru"]),
  );
  const [newKey, setNewKey] = useState("");
  const [newLanguageCode, setNewLanguageCode] = useState("");
  const [newLanguageName, setNewLanguageName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("main");
  const [hasChanges, setHasChanges] = useState(false);

  // Load translations from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem("customTranslations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTranslationData(parsed.data);
        setLanguages(parsed.languages || ["en", "tr", "ru"]);
        setActiveLanguages(
          new Set(parsed.activeLanguages || ["en", "tr", "ru"]),
        );
      } catch (error) {
        console.error("Failed to load translations:", error);
        loadDefaultTranslations();
      }
    } else {
      loadDefaultTranslations();
    }
  }, []);

  const loadDefaultTranslations = () => {
    const data: TranslationData = {};

    // Flatten nested translations
    const flatten = (obj: any, prefix = ""): void => {
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "object" && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          if (!data[newKey]) {
            data[newKey] = {};
          }
        }
      }
    };

    // Process each language
    for (const lang of Object.keys(defaultTranslations)) {
      flatten(defaultTranslations[lang as Language]);
    }

    // Fill in values
    for (const lang of Object.keys(defaultTranslations)) {
      const langData = defaultTranslations[lang as Language];
      const fillValues = (obj: any, prefix = ""): void => {
        for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;

          if (typeof value === "object" && !Array.isArray(value)) {
            fillValues(value, newKey);
          } else {
            data[newKey][lang] = value;
          }
        }
      };
      fillValues(langData);
    }

    setTranslationData(data);
  };

  const handleSave = () => {
    const toSave = {
      data: translationData,
      languages,
      activeLanguages: Array.from(activeLanguages),
    };
    localStorage.setItem("customTranslations", JSON.stringify(toSave));
    setHasChanges(false);

    // Show success message and reload after a short delay
    alert("Çeviriler kaydedildi! Sayfa yenileniyor...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleTranslationChange = (
    key: string,
    lang: string,
    value: string,
  ) => {
    setTranslationData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleAddKey = () => {
    if (!newKey.trim()) return;

    const key = newKey.trim();
    if (translationData[key]) {
      alert("Bu key zaten mevcut!");
      return;
    }

    const newData: { [lang: string]: string } = {};
    languages.forEach((lang) => {
      newData[lang] = "";
    });

    setTranslationData((prev) => ({
      ...prev,
      [key]: newData,
    }));
    setNewKey("");
    setHasChanges(true);
  };

  const handleDeleteKey = (key: string) => {
    if (!confirm(`"${key}" key'ini silmek istediğinizden emin misiniz?`))
      return;

    const newData = { ...translationData };
    delete newData[key];
    setTranslationData(newData);
    setHasChanges(true);
  };

  const handleAddLanguage = () => {
    if (!newLanguageCode.trim() || !newLanguageName.trim()) {
      alert("Dil kodu ve adı gerekli!");
      return;
    }

    const langCode = newLanguageCode.trim() as Language;
    if (languages.includes(langCode)) {
      alert("Bu dil zaten mevcut!");
      return;
    }

    setLanguages((prev) => [...prev, langCode]);
    setActiveLanguages((prev) => new Set([...prev, langCode]));

    // Add empty translations for new language
    const newData = { ...translationData };
    Object.keys(newData).forEach((key) => {
      newData[key][langCode] = "";
    });
    setTranslationData(newData);

    setNewLanguageCode("");
    setNewLanguageName("");
    setHasChanges(true);
  };

  const toggleLanguageActive = (lang: Language) => {
    const newActive = new Set(activeLanguages);
    if (newActive.has(lang)) {
      if (newActive.size === 1) {
        alert("En az bir dil aktif olmalı!");
        return;
      }
      newActive.delete(lang);
    } else {
      newActive.add(lang);
    }
    setActiveLanguages(newActive);
    setHasChanges(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(
      {
        data: translationData,
        languages,
        activeLanguages: Array.from(activeLanguages),
      },
      null,
      2,
    );
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `translations-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setTranslationData(imported.data);
        setLanguages(imported.languages);
        setActiveLanguages(new Set(imported.activeLanguages));
        setHasChanges(true);
        alert("Çeviriler başarıyla içe aktarıldı!");
      } catch (error) {
        alert("Dosya okuma hatası!");
      }
    };
    reader.readAsText(file);
  };

  // Get sections
  const sections = new Set<string>();
  Object.keys(translationData).forEach((key) => {
    const section = key.includes(".") ? key.split(".")[0] : "main";
    sections.add(section);
  });

  // Filter keys
  const filteredKeys = Object.keys(translationData)
    .filter((key) => {
      const section = key.includes(".") ? key.split(".")[0] : "main";
      if (selectedSection !== "all" && section !== selectedSection)
        return false;
      if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    })
    .sort();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[2000px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Çeviri Yönetimi</h1>
              <p className="text-gray-600">
                Tüm dil çevirilerini buradan yönetin
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                İçe Aktar
              </label>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Dışa Aktar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Kaydet
                {hasChanges && " *"}
              </button>
            </div>
          </div>

          {/* Language Management */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Dil Yönetimi</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {languages.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg"
                >
                  <span className="font-medium uppercase">{lang}</span>
                  <button
                    onClick={() => toggleLanguageActive(lang)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {activeLanguages.has(lang) ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dil kodu (örn: de, fr)"
                value={newLanguageCode}
                onChange={(e) =>
                  setNewLanguageCode(e.target.value.toLowerCase())
                }
                className="flex-1 px-3 py-2 border rounded-lg"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="Dil adı (örn: Deutsch, Français)"
                value={newLanguageName}
                onChange={(e) => setNewLanguageName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleAddLanguage}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dil Ekle
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Ara</label>
                <input
                  type="text"
                  placeholder="Key ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Bölüm</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">Tümü</option>
                  {Array.from(sections)
                    .sort()
                    .map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add New Key */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Yeni Çeviri Ekle</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key (örn: mySection.myKey)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleAddKey}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>
          </div>

          {/* Translations Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold sticky left-0 bg-gray-50 z-10">
                      Key ({filteredKeys.length})
                    </th>
                    {languages.map((lang) => (
                      <th
                        key={lang}
                        className="px-6 py-3 text-left text-sm font-semibold min-w-[300px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="uppercase">{lang}</span>
                          {!activeLanguages.has(lang) && (
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                              Pasif
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-sm font-semibold sticky right-0 bg-gray-50">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredKeys.map((key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono sticky left-0 bg-white">
                        {key}
                      </td>
                      {languages.map((lang) => (
                        <td key={lang} className="px-6 py-3">
                          <input
                            type="text"
                            value={translationData[key]?.[lang] || ""}
                            onChange={(e) =>
                              handleTranslationChange(key, lang, e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            placeholder={`${lang} çevirisi...`}
                          />
                        </td>
                      ))}
                      <td className="px-6 py-3 sticky right-0 bg-white">
                        <button
                          onClick={() => handleDeleteKey(key)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Sonuç bulunamadı
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
