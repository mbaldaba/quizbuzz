/**
 * React Query Hooks
 * 
 * Type-safe React Query hooks for all API endpoints.
 * These hooks wrap the generated OpenAPI client functions and provide
 * React Query's caching, refetching, and state management capabilities.
 * 
 * Usage:
 * ```typescript
 * import { useGetRooms, useCreateRoom } from '@repo/api-client';
 * 
 * function RoomList() {
 *   const { data, isLoading, error } = useGetRooms();
 *   // ...
 * }
 * 
 * function CreateRoomForm() {
 *   const createRoom = useCreateRoom();
 *   
 *   const handleSubmit = async (formData) => {
 *     await createRoom.mutateAsync({ body: formData });
 *   };
 *   // ...
 * }
 * ```
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

// Import all generated services
// Note: These will be available after running the code generation
import type * as Services from './generated/index.js';

/**
 * Type utility to extract the data type from a service function
 */
type ServiceData<T> = T extends () => Promise<infer R> ? R : never;
type ServiceDataWithOptions<T> = T extends (options: infer O) => Promise<infer R> ? { data: R; options: O } : never;

/**
 * Generic hook factory for GET requests (queries)
 * 
 * @param queryKey - The query key for caching
 * @param queryFn - The service function to call
 * @param options - React Query options
 */
export function createQueryHook<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Generic hook factory for mutations (POST, PUT, PATCH, DELETE)
 * 
 * @param mutationFn - The service function to call
 * @param options - React Query mutation options
 */
export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    ...options,
  });
}

/**
 * Example hooks - These will be replaced/extended based on your actual API endpoints
 * after code generation. You can use these as templates.
 */

// Export utility functions for custom hook creation
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Re-export types for consumers
 */
export type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
