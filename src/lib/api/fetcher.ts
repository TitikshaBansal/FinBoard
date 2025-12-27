interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
};

export const fetchApi = async (
  url: string,
  options: FetchOptions = {}
): Promise<any> => {
  try {
    const response = await fetchWithTimeout(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new ApiError('Rate limit exceeded. Please try again later.', 429);
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    
    throw new ApiError(error.message || 'An unexpected error occurred', 0);
  }
};

export const testApiConnection = async (url: string): Promise<any> => {
  return fetchApi(url, { method: 'GET' });
};

