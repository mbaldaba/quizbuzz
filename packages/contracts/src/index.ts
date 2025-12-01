/**
 * QuizBuzz Contracts
 * 
 * Shared type definitions and event contracts for Socket.IO communication
 * between the API server and client applications.
 * 
 * This package provides type-safe event definitions for real-time quiz functionality.
 */

// ============================================================================
// Socket.IO Event Payloads
// ============================================================================

// Question Types
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_OR_FALSE' | 'IDENTIFICATION';

// Question Choice
export interface QuestionChoice {
  id: string;
  value: string;
}

// ============================================================================
// Client → Server Events
// ============================================================================

export interface JoinRoomPayload {
  roomId: string;
  token: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SubmitAnswerPayload {
  questionId: string;
  answerId?: string;      // For MULTIPLE_CHOICE/TRUE_OR_FALSE
  answerText?: string;    // For IDENTIFICATION
}

// ============================================================================
// Server → Client Events
// ============================================================================

export interface RoomJoinedPayload {
  participantId: string;
  nickname: string;
  roomId: string;
}

export interface ParticipantJoinedPayload {
  participantId: string;
  nickname: string;
}

export interface ParticipantLeftPayload {
  participantId: string;
  nickname: string;
}

export interface QuizStartedPayload {
  roomId: string;
  startedAt: string; // ISO date string
}

export interface QuizEndedPayload {
  roomId: string;
  endedAt: string; // ISO date string
}

export interface NextQuestionPayload {
  questionId: string;
  type: QuestionType;
  description: string;
  choices: QuestionChoice[];  // Empty array for IDENTIFICATION
  questionNumber: number;
}

export interface AnswerSubmittedPayload {
  questionId: string;
  accepted: boolean;
}

export interface AnswerRevealedPayload {
  questionId: string;
  correctAnswerId?: string;     // For MULTIPLE_CHOICE/TRUE_OR_FALSE
  correctAnswerText?: string;   // For IDENTIFICATION
  correctAnswerValue: string;   // Display text of correct answer
  firstCorrectParticipant?: {
    participantId: string;
    nickname: string;
  };
}

export interface ParticipantScore {
  participantId: string;
  nickname: string;
  answeredCorrectly: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface ScoresUpdatePayload {
  questionId: string;
  scores: ParticipantScore[];  // All participants, sorted by totalScore desc
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// ============================================================================
// Event Name Constants
// ============================================================================

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_ROOM: 'JOIN_ROOM',
  LEAVE_ROOM: 'LEAVE_ROOM',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  
  // Server → Client
  ROOM_JOINED: 'ROOM_JOINED',
  PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
  PARTICIPANT_LEFT: 'PARTICIPANT_LEFT',
  QUIZ_STARTED: 'QUIZ_STARTED',
  QUIZ_ENDED: 'QUIZ_ENDED',
  NEXT_QUESTION: 'NEXT_QUESTION',
  ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
  ANSWER_REVEALED: 'ANSWER_REVEALED',
  SCORES_UPDATE: 'SCORES_UPDATE',
  ERROR: 'ERROR',
} as const;

// ============================================================================
// Type-safe event map for Socket.IO
// ============================================================================

export interface ServerToClientEvents {
  [SOCKET_EVENTS.ROOM_JOINED]: (payload: RoomJoinedPayload) => void;
  [SOCKET_EVENTS.PARTICIPANT_JOINED]: (payload: ParticipantJoinedPayload) => void;
  [SOCKET_EVENTS.PARTICIPANT_LEFT]: (payload: ParticipantLeftPayload) => void;
  [SOCKET_EVENTS.QUIZ_STARTED]: (payload: QuizStartedPayload) => void;
  [SOCKET_EVENTS.QUIZ_ENDED]: (payload: QuizEndedPayload) => void;
  [SOCKET_EVENTS.NEXT_QUESTION]: (payload: NextQuestionPayload) => void;
  [SOCKET_EVENTS.ANSWER_SUBMITTED]: (payload: AnswerSubmittedPayload) => void;
  [SOCKET_EVENTS.ANSWER_REVEALED]: (payload: AnswerRevealedPayload) => void;
  [SOCKET_EVENTS.SCORES_UPDATE]: (payload: ScoresUpdatePayload) => void;
  [SOCKET_EVENTS.ERROR]: (payload: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload) => void;
  [SOCKET_EVENTS.LEAVE_ROOM]: (payload: LeaveRoomPayload) => void;
  [SOCKET_EVENTS.SUBMIT_ANSWER]: (payload: SubmitAnswerPayload) => void;
}

/**
 * Unified server event type with discriminated union
 * Each event contains its type and corresponding payload
 */
export type ServerEvent = {
  [K in keyof ServerToClientEvents]: {
    type: K;
    payload: Parameters<ServerToClientEvents[K]>[0];
  };
}[keyof ServerToClientEvents];
