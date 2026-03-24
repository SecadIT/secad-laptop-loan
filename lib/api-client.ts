/**
 * Get headers for internal API requests
 * Includes x-api-key for authentication
 */
export function getApiHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
  };
}

/**
 * Fetch wrapper for internal API calls with authentication
 */
export async function fetchApi(url: string, options?: RequestInit) {
  const headers = getApiHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
}
