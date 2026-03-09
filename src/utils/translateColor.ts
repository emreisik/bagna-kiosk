/**
 * Turkce ozel karakterleri ASCII karsiliklarina donusturur.
 * "Kırmızı" → "kirmizi", "Mürdüm" → "murdum", "Yeşil" → "yesil"
 */
function normalizeTurkish(str: string): string {
  return str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/İ/g, "i")
    .trim();
}

/**
 * Veritabanından gelen Türkçe renk adını, aktif dile göre çevirir.
 * colorMap (DB'den gelen) varsa onu kullanır, yoksa orijinal adı döndürür.
 *
 * colorMap format: { "siyah": { "tr": "Siyah", "en": "Black", "ru": "Чёрный" }, ... }
 *
 * Hem ASCII key'ler (siyah, kirmizi) hem de Turkce key'ler (Siyah, Kırmızı) ile calisir.
 */
export function translateColor(
  color: string,
  language: string,
  colorMap?: Record<string, Record<string, string>>,
): string {
  if (!colorMap) return color;

  // 1. Direkt eslestirme (lowercase)
  const key = color.toLowerCase().trim();
  if (colorMap[key]?.[language]) {
    return colorMap[key][language];
  }

  // 2. Turkce karakter normalizasyonu ile eslestirme
  const normalized = normalizeTurkish(color);
  if (colorMap[normalized]?.[language]) {
    return colorMap[normalized][language];
  }

  // 3. colorMap key'lerini de normalize ederek eslestir
  // (eger colorMap key'leri de Turkce karakterli ise)
  for (const mapKey of Object.keys(colorMap)) {
    if (normalizeTurkish(mapKey) === normalized && colorMap[mapKey][language]) {
      return colorMap[mapKey][language];
    }
  }

  return color;
}
