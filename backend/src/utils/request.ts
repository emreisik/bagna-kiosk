/**
 * Express route parameter helper utilities
 */

/**
 * Express req.params değerleri string | string[] tipinde olabilir
 * Bu helper her zaman string döndürür
 */
export function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0] || "";
  }
  return param || "";
}

/**
 * Zorunlu parameter için (undefined olamaz)
 */
export function getRequiredParam(param: string | string[] | undefined): string {
  const value = getParam(param);
  if (!value) {
    throw new Error("Required parameter is missing");
  }
  return value;
}
