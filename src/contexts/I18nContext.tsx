import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { translations, Language } from "../i18n/translations";
import { kioskConfig } from "../config/kiosk.config";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
}

interface TranslationData {
  [key: string]: {
    [lang: string]: string;
  };
}

interface CustomTranslations {
  data: TranslationData;
  languages: Language[];
  activeLanguages: Language[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Convert flat translation data to nested structure
function unflattenTranslations(flatData: TranslationData, lang: Language): any {
  const result: any = {};

  for (const key in flatData) {
    const value = flatData[key][lang];
    if (!value) continue;

    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

function applyCustomTranslations(
  parsed: CustomTranslations,
  setCurrentTranslations: (t: any) => void,
  setAvailableLanguages: (langs: Language[]) => void,
) {
  const customTranslations: any = {};
  for (const lang of parsed.activeLanguages) {
    customTranslations[lang] = unflattenTranslations(parsed.data, lang);
  }
  setCurrentTranslations(customTranslations);
  setAvailableLanguages(parsed.activeLanguages);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Load saved language from localStorage or use default
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("selectedLanguage");
    return (saved as Language) || kioskConfig.behavior.defaultLanguage;
  });

  const [currentTranslations, setCurrentTranslations] =
    useState<any>(translations);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([
    "en",
    "tr",
    "ru",
  ]);

  // Custom setLanguage that persists to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
  }, []);

  // Load translations: DB > localStorage > static fallback
  useEffect(() => {
    let cancelled = false;

    async function loadTranslations() {
      // 1. Veritabanindan cevirileri yukle
      try {
        const response = await fetch(`${API_URL}/settings`);
        if (response.ok) {
          const settings: Array<{ key: string; value: string }> =
            await response.json();
          const translationsEntry = settings.find(
            (s) => s.key === "translations",
          );
          if (translationsEntry && !cancelled) {
            const parsed: CustomTranslations = JSON.parse(
              translationsEntry.value,
            );
            if (parsed.data && parsed.activeLanguages) {
              applyCustomTranslations(
                parsed,
                setCurrentTranslations,
                setAvailableLanguages,
              );
              return; // DB'den basariyla yuklendi
            }
          }
        }
      } catch {
        // API hatasi - fallback'e devam
      }

      // 2. localStorage fallback (admin panel override)
      if (cancelled) return;
      const saved = localStorage.getItem("customTranslations");
      if (saved) {
        try {
          const parsed: CustomTranslations = JSON.parse(saved);
          applyCustomTranslations(
            parsed,
            setCurrentTranslations,
            setAvailableLanguages,
          );
          return;
        } catch {
          // Parse hatasi - static fallback
        }
      }

      // 3. Static fallback (translations.ts)
      // Zaten varsayilan olarak yukleniyor, birsey yapmaya gerek yok
    }

    loadTranslations();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dil degistiginde, mevcut dil aktif dillerde yoksa ilk dile gec
  useEffect(() => {
    if (
      availableLanguages.length > 0 &&
      !availableLanguages.includes(language)
    ) {
      setLanguage(availableLanguages[0]);
    }
  }, [availableLanguages, language, setLanguage]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = currentTranslations[language];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <I18nContext.Provider
      value={{ language, setLanguage, t, availableLanguages }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
