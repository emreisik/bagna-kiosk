/**
 * Veritabanından gelen Türkçe renk adını, aktif dile göre çevirir.
 * t() fonksiyonu ile colors.{key} lookup yapar.
 * Çeviri bulunamazsa orijinal renk adını döndürür.
 */
export function translateColor(
  color: string,
  t: (key: string) => string,
): string {
  const key = `colors.${color.toLowerCase().trim()}`;
  const translated = t(key);
  // t() bulamazsa key'in kendisini döndürür
  return translated === key ? color : translated;
}
