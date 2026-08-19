let API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured in environment variables");
}
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}
export const API_BASE = `${API_URL}/v1`;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  
  // We assume Dev Mode auth mock handles the org_id, so we don't strictly need a Bearer token here, 
  // but if we were using Clerk, we'd inject it here.
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "Unknown Error";
    try {
      const errBody = await response.json();
      errorDetail = errBody.error?.message || errBody.message || JSON.stringify(errBody);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`API Error ${response.status}: ${errorDetail}`);
  }

  // Handle empty responses
  if (response.status === 204) return null;
  
  try {
    return await response.json();
  } catch {
    return null; // Return null if not JSON
  }
}
