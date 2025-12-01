/**
 * API Client Package
 * Shared types and interfaces for Socket.IO events between API and clients
 */

// Re-export all types and constants from socket-client
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
} from './socket-client.js';

export { SOCKET_EVENTS, QuizSocketClient } from './socket-client.js';

