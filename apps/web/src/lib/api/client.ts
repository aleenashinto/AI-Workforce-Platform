let BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");
if (BASE_URL.includes("ai-workforce-api-pi.vercel.app")) {
  BASE_URL = "/api";
}
if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured in environment variables",
  );
}

/** Read a cookie by name (client-side only) */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function request(url: string, options: RequestInit = {}) {
  const token = getCookie("auth_token");
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  get: (url: string) => request(url),
  post: (url: string, body: unknown) =>
    request(url, { method: "POST", body: JSON.stringify(body) }),
  patch: (url: string, body: unknown) =>
    request(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: "DELETE" }),
};
