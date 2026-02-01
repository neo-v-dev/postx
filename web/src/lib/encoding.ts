/**
 * Encode string to Base64 (supports multibyte characters like Japanese)
 */
export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decode Base64 to string (supports multibyte characters like Japanese)
 */
export function decodeBase64(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}
