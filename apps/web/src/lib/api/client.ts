let BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");
if (BASE_URL.includes("ai-workforce-api-pi.vercel.app")) {
  BASE_URL = "/api";
}
if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured in environment variables",
  );
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
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
