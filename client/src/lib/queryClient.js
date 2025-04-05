import { QueryClient } from '@tanstack/react-query';

/**
 * Create a client for React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

/**
 * Make an API request to the backend
 * @param {string} method - The HTTP method
 * @param {string} url - The API URL
 * @param {Object} data - The request body
 * @returns {Promise<Response>} - The fetch response
 */
export async function apiRequest(method, url, data) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
  }
  
  return response;
}

/**
 * Default query function for React Query
 * @param {Object} queryKey - The query key object
 * @returns {Promise<T>} - The parsed response data
 */
export async function defaultQueryFn({ queryKey }) {
  const [url] = queryKey;
  const res = await apiRequest('GET', url);
  return await res.json();
}

// Configure the default query function
queryClient.setQueryDefaults({
  queryFn: defaultQueryFn,
});