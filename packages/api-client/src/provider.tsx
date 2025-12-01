/**
 * API Client Provider
 * 
 * React Query provider component for the QuizBuzz API client.
 * Wraps your app with QueryClientProvider and configures the API client.
 * 
 * Usage:
 * ```tsx
 * import { ApiClientProvider } from '@repo/api-client';
 * 
 * function App() {
 *   return (
 *     <ApiClientProvider baseUrl="http://localhost:5000">
 *       <YourApp />
 *     </ApiClientProvider>
 *   );
 * }
 * ```
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { createApiClient, type ApiClientConfig } from './api-client.js';

export interface ApiClientProviderProps extends ApiClientConfig {
  children: ReactNode;
  /**
   * Custom QueryClient instance. If not provided, a default one will be created.
   */
  queryClient?: QueryClient;
  /**
   * Default options for React Query QueryClient
   */
  queryClientConfig?: {
    defaultOptions?: {
      queries?: {
        staleTime?: number;
        cacheTime?: number;
        refetchOnWindowFocus?: boolean;
        refetchOnReconnect?: boolean;
        retry?: number | boolean;
      };
      mutations?: {
        retry?: number | boolean;
      };
    };
  };
}

/**
 * Default QueryClient configuration
 */
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

/**
 * Provider component that configures both the API client and React Query.
 * 
 * This component should wrap your entire app (or the part that needs API access).
 * It automatically configures the API client with the provided baseUrl and
 * sets up React Query for data fetching and caching.
 * 
 * @example
 * ```tsx
 * <ApiClientProvider baseUrl={import.meta.env.VITE_API_URL}>
 *   <App />
 * </ApiClientProvider>
 * ```
 */
export function ApiClientProvider({
  children,
  baseUrl,
  credentials,
  headers,
  queryClient: providedQueryClient,
  queryClientConfig,
}: ApiClientProviderProps) {
  // Create QueryClient instance (or use provided one)
  const [queryClient] = useState(
    () =>
      providedQueryClient ||
      new QueryClient(queryClientConfig || defaultQueryClientConfig)
  );

  // Configure the API client when baseUrl changes
  useEffect(() => {
    createApiClient({
      baseUrl,
      credentials,
      headers,
    });
  }, [baseUrl, credentials, headers]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Re-export QueryClient for consumers who want to create custom instances
 */
export { QueryClient } from '@tanstack/react-query';
