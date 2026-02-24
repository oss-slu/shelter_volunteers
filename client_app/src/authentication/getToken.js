function looksLikeJson(str) {
  const trimmed = str.trim();
  return (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("\"") ||
    trimmed === "null" ||
    trimmed === "true" ||
    trimmed === "false" ||
    /^-?\d/.test(trimmed)
  );
}

export function getToken() {
  // Guard for non-browser environments / early execution
  if (typeof window === "undefined" || !window.localStorage) return undefined;

  const tokenString = window.localStorage.getItem("token");
  if (!tokenString) return undefined;

  // Historically this app stored either:
  // - a raw JWT string: "eyJhbGciOi..."
  // - a JSON-stringified value: "\"eyJhbGciOi...\"" (or other JSON)
  // Be tolerant to both.
  const trimmed = tokenString.trim();
  if (!looksLikeJson(trimmed)) return trimmed;

  try {
    return JSON.parse(trimmed);
  } catch {
    // If parsing fails, fall back to the raw string to avoid crashing the app
    return trimmed;
  }
}


export function removeToken() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem("token");
}

export function setToken(token) {
  if (typeof window === "undefined" || !window.localStorage) return;
  // Store tokens as plain strings for interoperability with fetch/axios headers.
  if (typeof token === "string") {
    window.localStorage.setItem("token", token);
  } else {
    window.localStorage.setItem("token", JSON.stringify(token));
  }
}

export function haveToken() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const token = window.localStorage.getItem("token");
  return !!token;
}