import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@repo/contracts';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  ServerEvent,
  JoinRoomPayload,
  LeaveRoomPayload,
  RoomJoinedPayload,
  ErrorPayload,
} from '@repo/contracts';

// Re-export all types from contracts for convenience
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

/**
 * Socket.IO client for QuizBuzz real-time communication
 * 
 * Usage:
 * ```typescript
 * const client = new QuizSocketClient('http://localhost:3000');
 * 
 * // Must join first
 * const joinData = await client.join('room-123', 'jwt-token');
 * 
 * // Listen to all server events with one callback
 * client.on((evt) => {
 *   switch (evt.type) {
 *     case 'NEXT_QUESTION':
 *       console.log('Question:', evt.payload.description);
 *       break;
 *     case 'ANSWER_REVEALED':
 *       console.log('Answer:', evt.payload.correctAnswerValue);
 *       break;
 *   }
 * });
 * 
 * // Emit events to server
 * client.emit('SUBMIT_ANSWER', {
 *   questionId: 'q1',
 *   answerId: 'choice-a'
 * });
 * ```
 */
export class QuizSocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private connected: boolean = false;
  private roomId?: string;
  private token?: string;
  private eventCallback?: (event: ServerEvent) => void;

  /**
   * Create a new QuizSocketClient
   * @param url - The Socket.IO server URL (e.g., 'http://localhost:3000')
   */
  constructor(url: string) {
    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up internal event listeners
    this.setupEventListeners();
  }

  /**
   * Set up listeners for all server→client events
   * These forward events to the unified callback
   */
  private setupEventListeners(): void {
    // Listen to all server→client events and forward to callback
    (Object.keys(SOCKET_EVENTS) as Array<keyof typeof SOCKET_EVENTS>).forEach((key) => {
      const eventName = SOCKET_EVENTS[key];
      
      // Only listen to server→client events (not client→server)
      if (this.isServerToClientEvent(eventName)) {
        this.socket.on(eventName as keyof ServerToClientEvents, (payload: any) => {
          if (this.eventCallback) {
            this.eventCallback({
              type: eventName,
              payload,
            } as ServerEvent);
          }
        });
      }
    });
  }

  /**
   * Check if an event is a server→client event
   */
  private isServerToClientEvent(eventName: string): boolean {
    const serverEvents: string[] = [
      SOCKET_EVENTS.ROOM_JOINED,
      SOCKET_EVENTS.PARTICIPANT_JOINED,
      SOCKET_EVENTS.PARTICIPANT_LEFT,
      SOCKET_EVENTS.QUIZ_STARTED,
      SOCKET_EVENTS.QUIZ_ENDED,
      SOCKET_EVENTS.NEXT_QUESTION,
      SOCKET_EVENTS.ANSWER_SUBMITTED,
      SOCKET_EVENTS.ANSWER_REVEALED,
      SOCKET_EVENTS.SCORES_UPDATE,
      SOCKET_EVENTS.ERROR,
    ];
    return serverEvents.includes(eventName);
  }

  /**
   * Join a room with authentication token
   * This must be called before using on() or emit()
   * 
   * @param roomId - The room ID to join
   * @param token - JWT authentication token
   * @returns Promise that resolves with room joined data
   * @throws Error if join fails
   */
  async join(roomId: string, token: string): Promise<RoomJoinedPayload> {
    return new Promise((resolve, reject) => {
      const joinPayload: JoinRoomPayload = { roomId, token };

      // Set up one-time listeners for the response
      const onRoomJoined = (payload: RoomJoinedPayload) => {
        this.connected = true;
        this.roomId = roomId;
        this.token = token;
        
        // Clean up listeners
        this.socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
        this.socket.off(SOCKET_EVENTS.ERROR, onError);
        
        resolve(payload);
      };

      const onError = (payload: ErrorPayload) => {
        // Only handle errors related to joining
        // Clean up listeners
        this.socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
        this.socket.off(SOCKET_EVENTS.ERROR, onError);
        
        reject(new Error(payload.message || 'Failed to join room'));
      };

      // Attach temporary listeners
      this.socket.once(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
      this.socket.once(SOCKET_EVENTS.ERROR, onError);

      // Emit join event
      this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, joinPayload);

      // Timeout after 10 seconds
      setTimeout(() => {
        this.socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
        this.socket.off(SOCKET_EVENTS.ERROR, onError);
        reject(new Error('Join room timeout'));
      }, 10000);
    });
  }

  /**
   * Register a unified callback for all server→client events
   * Must call join() before using this method
   * 
   * @param callback - Function that receives all server events with type and payload
   * @throws Error if not connected (must join first)
   */
  on(callback: (event: ServerEvent) => void): void {
    if (!this.connected) {
      throw new Error('Must call join() before registering event listeners');
    }
    this.eventCallback = callback;
  }

  /**
   * Emit a client→server event
   * Must call join() before using this method
   * 
   * @param event - The event name (excluding JOIN_ROOM which is handled by join())
   * @param payload - The event payload
   * @throws Error if not connected (must join first)
   */
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    payload: Parameters<ClientToServerEvents[K]>[0]
  ): void {
    if (!this.connected) {
      throw new Error('Must call join() before emitting events');
    }

    // JOIN_ROOM is handled by the join() method
    if (event === SOCKET_EVENTS.JOIN_ROOM) {
      throw new Error('Use join() method instead of emitting JOIN_ROOM directly');
    }

    this.socket.emit(event as any, payload);
  }

  /**
   * Leave the current room
   * Emits LEAVE_ROOM event and disconnects
   */
  async leave(): Promise<void> {
    if (!this.connected || !this.roomId) {
      return;
    }

    const leavePayload: LeaveRoomPayload = { roomId: this.roomId };
    this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, leavePayload);
    
    this.connected = false;
    this.roomId = undefined;
    this.token = undefined;
    this.eventCallback = undefined;
  }

  /**
   * Disconnect the socket connection
   */
  disconnect(): void {
    this.socket.disconnect();
    this.connected = false;
    this.roomId = undefined;
    this.token = undefined;
    this.eventCallback = undefined;
  }

  /**
   * Check if currently connected to a room
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the current room ID
   */
  getRoomId(): string | undefined {
    return this.roomId;
  }
}
