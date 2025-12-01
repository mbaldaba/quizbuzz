/**
 * API Client Wrapper
 * 
 * Provides a configured fetch client for making HTTP requests to the QuizBuzz API.
 * This wrapper configures the generated OpenAPI client with:
 * - Base URL configuration
 * - Credentials (cookies) included in all requests
 * - Request/response interceptors
 */

import { client } from './generated/client.gen.js';

export interface ApiClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}

/**
 * Create and configure an API client instance
 * 
 * @param config - Configuration options for the API client
 * @param config.baseUrl - The base URL of the API (e.g., 'http://localhost:5000')
 * @param config.credentials - Credentials mode for requests (default: 'include')
 * @param config.headers - Additional headers to include in all requests
 * 
 * @example
 * ```typescript
 * const apiClient = createApiClient({ 
 *   baseUrl: 'http://localhost:5000'
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig) {
  // Configure the global client
  client.setConfig({
    baseUrl: config.baseUrl,
    credentials: config.credentials || 'include',
    headers: config.headers,
  });

  return client;
}

// Re-export the client for direct usage if needed
export { client };
