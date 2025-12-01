import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  SOCKET_EVENTS,
  JoinRoomPayload,
  LeaveRoomPayload,
  SubmitAnswerPayload,
  RoomJoinedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  AnswerSubmittedPayload,
  ErrorPayload,
  ServerToClientEvents,
  ClientToServerEvents,
  NextQuestionPayload,
  AnswerRevealedPayload,
  ScoresUpdatePayload,
  QuizStartedPayload,
  QuizEndedPayload,
} from '@repo/contracts';
import { EventsService } from './events.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this based on your frontend URLs
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up any room memberships
    await this.eventsService.handleClientDisconnect(client.id);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @MessageBody() payload: any,
  ) {
    const joinPayload = payload as JoinRoomPayload;
    try {
      // Validate JWT token
      const decoded = this.jwtService.verify(joinPayload.token);
      const { sessionId, roomId: tokenRoomId } = decoded;

      // Verify room ID matches token
      if (tokenRoomId !== joinPayload.roomId) {
        const error: ErrorPayload = {
          message: 'Token does not match room ID',
          code: 'INVALID_TOKEN',
        };
        client.emit(SOCKET_EVENTS.ERROR, error);
        return;
      }
      // Get participant details and validate session
      const participant = await this.eventsService.validateAndGetParticipant(
        sessionId,
        joinPayload.roomId,
      );

      if (!participant) {
        const error: ErrorPayload = {
          message: 'Invalid session or participant not found',
          code: 'INVALID_SESSION',
        };
        client.emit(SOCKET_EVENTS.ERROR, error);
        return;
      }

      // Store client mapping
      await this.eventsService.addClientToRoom(
        client.id,
        joinPayload.roomId,
        participant.id,
      );

      // Join Socket.IO room
      await client.join(joinPayload.roomId);

      // Send confirmation to the client
      const joinedPayload: RoomJoinedPayload = {
        participantId: participant.id,
        nickname: participant.nickname,
        roomId: joinPayload.roomId,
      };
      client.emit(SOCKET_EVENTS.ROOM_JOINED, joinedPayload);

      // Broadcast to others in the room
      const participantJoinedPayload: ParticipantJoinedPayload = {
        participantId: participant.id,
        nickname: participant.nickname,
      };
      client
        .to(joinPayload.roomId)
        .emit(SOCKET_EVENTS.PARTICIPANT_JOINED, participantJoinedPayload);

      this.logger.log(
        `Participant ${participant.nickname} joined room ${joinPayload.roomId}`,
      );
    } catch (error) {
      this.logger.error('Error in JOIN_ROOM:', error);
      const errorPayload: ErrorPayload = {
        message: error instanceof UnauthorizedException 
          ? 'Invalid or expired token'
          : 'Failed to join room',
        code: 'JOIN_ROOM_ERROR',
      };
      client.emit(SOCKET_EVENTS.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @MessageBody() payload: any,
  ) {
    const leavePayload = payload as LeaveRoomPayload;
    try {
      const participant = await this.eventsService.getParticipantByClient(
        client.id,
      );

      if (participant) {
        // Leave Socket.IO room
        await client.leave(leavePayload.roomId);

        // Remove client mapping
        await this.eventsService.removeClientFromRoom(client.id);

        // Broadcast to others
        const participantLeftPayload: ParticipantLeftPayload = {
          participantId: participant.participantId,
          nickname: participant.nickname,
        };
        client
          .to(leavePayload.roomId)
          .emit(SOCKET_EVENTS.PARTICIPANT_LEFT, participantLeftPayload);

        this.logger.log(
          `Participant ${participant.nickname} left room ${leavePayload.roomId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in LEAVE_ROOM:', error);
      const errorPayload: ErrorPayload = {
        message: 'Failed to leave room',
        code: 'LEAVE_ROOM_ERROR',
      };
      client.emit(SOCKET_EVENTS.ERROR, errorPayload);
    }
  }
  @SubscribeMessage(SOCKET_EVENTS.SUBMIT_ANSWER)
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @MessageBody() payload: any,
  ) {
    const submitPayload = payload as SubmitAnswerPayload;
    try {
      const participant = await this.eventsService.getParticipantByClient(
        client.id,
      );

      if (!participant) {
        const error: ErrorPayload = {
          message: 'Not in a room',
          code: 'NOT_IN_ROOM',
        };
        client.emit(SOCKET_EVENTS.ERROR, error);
        return;
      }

      // Submit answer and get result
      const result = await this.eventsService.submitAnswer(
        participant.roomId,
        participant.participantId,
        submitPayload.questionId,
        submitPayload.answerId,
        submitPayload.answerText,
      );

      // Send acknowledgment
      const response: AnswerSubmittedPayload = {
        questionId: submitPayload.questionId,
        accepted: result.accepted,
      };
      client.emit(SOCKET_EVENTS.ANSWER_SUBMITTED, response);

      if (!result.accepted) {
        const error: ErrorPayload = {
          message: result.reason || 'Answer not accepted',
          code: result.code || 'ANSWER_REJECTED',
        };
        client.emit(SOCKET_EVENTS.ERROR, error);
      }
    } catch (error) {
      this.logger.error('Error in SUBMIT_ANSWER:', error);
      const errorPayload: ErrorPayload = {
        message: 'Failed to submit answer',
        code: 'SUBMIT_ANSWER_ERROR',
      };
      client.emit(SOCKET_EVENTS.ERROR, errorPayload);
    }
  }

  // ============================================================================
  // Methods called by QuizmasterService to broadcast events
  // ============================================================================

  broadcastNextQuestion(roomId: string, payload: NextQuestionPayload) {
    this.server.to(roomId).emit(SOCKET_EVENTS.NEXT_QUESTION, payload);
    this.logger.log(`Broadcasting NEXT_QUESTION to room ${roomId}`);
  }

  broadcastAnswerRevealed(roomId: string, payload: AnswerRevealedPayload) {
    this.server.to(roomId).emit(SOCKET_EVENTS.ANSWER_REVEALED, payload);
    this.logger.log(`Broadcasting ANSWER_REVEALED to room ${roomId}`);
  }

  broadcastScoresUpdate(roomId: string, payload: ScoresUpdatePayload) {
    this.server.to(roomId).emit(SOCKET_EVENTS.SCORES_UPDATE, payload);
    this.logger.log(`Broadcasting SCORES_UPDATE to room ${roomId}`);
  }

  broadcastQuizStarted(roomId: string, payload: QuizStartedPayload) {
    this.server.to(roomId).emit(SOCKET_EVENTS.QUIZ_STARTED, payload);
    this.logger.log(`Broadcasting QUIZ_STARTED to room ${roomId}`);
  }

  broadcastQuizEnded(roomId: string, payload: QuizEndedPayload) {
    this.server.to(roomId).emit(SOCKET_EVENTS.QUIZ_ENDED, payload);
    this.logger.log(`Broadcasting QUIZ_ENDED to room ${roomId}`);
  }
}
