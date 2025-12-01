/**
 * API Client Package
 * 
 * This package provides:
 * 1. Socket.IO client for real-time events
 * 2. Type-safe REST API client generated from OpenAPI spec
 * 3. React Query hooks for data fetching and mutations
 */

// ============================================================================
// Socket.IO Client (Real-time Events)
// ============================================================================

// Re-export all types from contracts
export type {
  QuestionType,
  QuestionChoice,
  JoinRoomPayload,
  LeaveRoomPayload,
  SubmitAnswerPayload,
  RoomJoinedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  QuizStartedPayload,
  QuizEndedPayload,
  NextQuestionPayload,
  AnswerSubmittedPayload,
  AnswerRevealedPayload,
  ParticipantScore,
  ScoresUpdatePayload,
  ErrorPayload,
  ServerToClientEvents,
  ClientToServerEvents,
  ServerEvent,
} from '@repo/contracts';

export { SOCKET_EVENTS } from '@repo/contracts';
export { QuizSocketClient } from './socket-client.js';

// ============================================================================
// REST API Client (HTTP Requests)
// ============================================================================

// API Client wrapper
export { createApiClient, client } from './api-client.js';
export type { ApiClientConfig } from './api-client.js';

// Provider component
export { ApiClientProvider, QueryClient } from './provider.js';
export type { ApiClientProviderProps } from './provider.js';

// React Query hooks and utilities
export {
  createQueryHook,
  createMutationHook,
  useQuery,
  useMutation,
  useQueryClient,
} from './hooks.js';

export type {
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from './hooks.js';

// Generated types and services (will be available after codegen)
// These exports will work after running: npm run codegen
export * from './generated/index.js';

