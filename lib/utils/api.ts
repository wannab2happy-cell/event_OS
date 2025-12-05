/**
 * API Fetcher Utility
 * 
 * Wrapper for fetch with error handling and type safety
 */

export interface ApiFetcherOptions extends RequestInit {
  baseUrl?: string;
}

export interface ApiFetcherResult<T> {
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Fetch API with error handling
 */
export async function apiFetch<T>(
  url: string,
  options?: ApiFetcherOptions
): Promise<ApiFetcherResult<T>> {
  try {
    const { baseUrl, ...fetchOptions } = options || {};
    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return { data: data as T, status: response.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error occurred',
    };
  }
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  url: string,
  body: any,
  options?: ApiFetcherOptions
): Promise<ApiFetcherResult<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * GET request helper
 */
export async function apiGet<T>(
  url: string,
  options?: ApiFetcherOptions
): Promise<ApiFetcherResult<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'GET',
  });
}

