/**
 * Veritabanından gelen Türkçe renk adını, aktif dile göre çevirir.
 * colorMap (DB'den gelen) varsa onu kullanır, yoksa orijinal adı döndürür.
 *
 * colorMap format: { "siyah": { "tr": "Siyah", "en": "Black", "ru": "Чёрный" }, ... }
 */
export function translateColor(
  color: string,
  language: string,
  colorMap?: Record<string, Record<string, string>>,
): string {
  if (!colorMap) return color;

  const key = color.toLowerCase().trim();
  const entry = colorMap[key];

  if (entry && entry[language]) {
    return entry[language];
  }

  return color;
}
