import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NextQuestionPayload,
  AnswerRevealedPayload,
  ScoresUpdatePayload,
  QuizStartedPayload,
  QuizEndedPayload,
  ParticipantScore,
  QuestionType,
} from '@repo/api-client';
import { QuestionType as PrismaQuestionType } from '@prisma/client';

interface ClientMapping {
  clientId: string;
  roomId: string;
  participantId: string;
  nickname: string;
}

interface AnswerSubmission {
  participantId: string;
  answerId?: string;
  answerText?: string;
  submittedAt: Date;
}

interface RoomState {
  roomId: string;
  currentQuestionId: string | null;
  isAcceptingAnswers: boolean;
  submissions: Map<string, AnswerSubmission>; // participantId -> submission
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  
  // Map of clientId -> ClientMapping
  private clients = new Map<string, ClientMapping>();
  
  // Map of roomId -> RoomState
  private roomStates = new Map<string, RoomState>();

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // Client Management
  // ============================================================================

  async validateAndGetParticipant(sessionId: string, roomId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            roomParticipations: {
              where: { roomId },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const participation = session.user.roomParticipations[0];
    if (!participation) {
      return null;
    }

    return {
      id: participation.id,
      nickname: participation.nickname,
      userId: session.userId,
    };
  }

  async addClientToRoom(
    clientId: string,
    roomId: string,
    participantId: string,
  ) {
    const participant = await this.prisma.roomParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    this.clients.set(clientId, {
      clientId,
      roomId,
      participantId,
      nickname: participant.nickname,
    });

    // Initialize room state if not exists
    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        roomId,
        currentQuestionId: null,
        isAcceptingAnswers: false,
        submissions: new Map(),
      });
    }
  }

  async removeClientFromRoom(clientId: string) {
    this.clients.delete(clientId);
  }

  async getParticipantByClient(clientId: string) {
    return this.clients.get(clientId) || null;
  }

  async handleClientDisconnect(clientId: string) {
    this.clients.delete(clientId);
  }

  // ============================================================================
  // Question Management
  // ============================================================================

  async startQuestion(roomId: string, questionId: string): Promise<NextQuestionPayload> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        choices: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Get question number (count of questions in room)
    const questionCount = await this.prisma.roomQuestion.count({
      where: { roomId },
    });

    // Update room state
    const roomState = this.roomStates.get(roomId);
    if (roomState) {
      roomState.currentQuestionId = questionId;
      roomState.isAcceptingAnswers = true;
      roomState.submissions.clear();
    }

    return {
      questionId: question.id,
      type: this.mapQuestionType(question.type),
      description: question.description,
      choices: question.choices,
      questionNumber: questionCount,
    };
  }

  // ============================================================================
  // Answer Submission
  // ============================================================================

  async submitAnswer(
    roomId: string,
    participantId: string,
    questionId: string,
    answerId?: string,
    answerText?: string,
  ): Promise<{ accepted: boolean; reason?: string; code?: string }> {
    const roomState = this.roomStates.get(roomId);

    if (!roomState) {
      return {
        accepted: false,
        reason: 'Room not found',
        code: 'ROOM_NOT_FOUND',
      };
    }

    if (roomState.currentQuestionId !== questionId) {
      return {
        accepted: false,
        reason: 'Question not active',
        code: 'QUESTION_NOT_ACTIVE',
      };
    }

    if (!roomState.isAcceptingAnswers) {
      return {
        accepted: false,
        reason: 'Not accepting answers',
        code: 'ANSWERS_CLOSED',
      };
    }

    // Check if participant already submitted
    if (roomState.submissions.has(participantId)) {
      return {
        accepted: false,
        reason: 'Answer already submitted',
        code: 'ALREADY_SUBMITTED',
      };
    }

    // Validate answer
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { choices: true },
    });

    if (!question) {
      return {
        accepted: false,
        reason: 'Question not found',
        code: 'QUESTION_NOT_FOUND',
      };
    }

    // Validate answerId if provided
    if (answerId) {
      const validChoice = question.choices.find((c) => c.id === answerId);
      if (!validChoice) {
        return {
          accepted: false,
          reason: 'Invalid answer choice',
          code: 'INVALID_CHOICE',
        };
      }
    }

    // Store submission
    roomState.submissions.set(participantId, {
      participantId,
      answerId,
      answerText,
      submittedAt: new Date(),
    });

    this.logger.log(
      `Answer submitted: Room ${roomId}, Participant ${participantId}, Question ${questionId}`,
    );

    return { accepted: true };
  }

  // ============================================================================
  // Answer Reveal & Scoring
  // ============================================================================

  async revealAnswer(roomId: string, questionId: string): Promise<{
    answerRevealed: AnswerRevealedPayload;
    scoresUpdate: ScoresUpdatePayload;
  }> {
    const roomState = this.roomStates.get(roomId);

    if (!roomState || roomState.currentQuestionId !== questionId) {
      throw new Error('Question not active in room');
    }

    // Stop accepting answers
    roomState.isAcceptingAnswers = false;

    // Get question with correct answer
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        choices: true,
        correctAnswer: true,
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Get all participants in room
    const participants = await this.prisma.roomParticipant.findMany({
      where: { roomId },
      include: {
        events: true,
      },
    });

    // Find first correct answer
    const submissions = Array.from(roomState.submissions.values());
    submissions.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());

    let firstCorrectParticipant: { participantId: string; nickname: string } | undefined;
    let firstCorrectSubmission: AnswerSubmission | undefined;

    for (const submission of submissions) {
      const isCorrect = this.checkAnswerCorrect(
        submission,
        question.correctAnswerId,
        question.correctAnswer?.value,
      );

      if (isCorrect) {
        const participant = participants.find((p) => p.id === submission.participantId);
        if (participant) {
          firstCorrectParticipant = {
            participantId: participant.id,
            nickname: participant.nickname,
          };
          firstCorrectSubmission = submission;
        }
        break;
      }
    }

    // Save all submissions to database
    for (const submission of submissions) {
      const isCorrect = this.checkAnswerCorrect(
        submission,
        question.correctAnswerId,
        question.correctAnswer?.value,
      );
      const pointsEarned =
        isCorrect && submission.participantId === firstCorrectSubmission?.participantId ? 1 : 0;

      await this.prisma.roomParticipantEvent.upsert({
        where: {
          roomParticipantId_questionId: {
            roomParticipantId: submission.participantId,
            questionId,
          },
        },
        create: {
          roomParticipantId: submission.participantId,
          questionId,
          selectedChoiceId: submission.answerId,
          value: pointsEarned,
        },
        update: {
          selectedChoiceId: submission.answerId,
          value: pointsEarned,
        },
      });
    }

    // Calculate scores for all participants
    const scores: ParticipantScore[] = await Promise.all(
      participants.map(async (participant) => {
        const submission = roomState.submissions.get(participant.id);
        const answeredCorrectly =
          submission &&
          this.checkAnswerCorrect(
            submission,
            question.correctAnswerId,
            question.correctAnswer?.value,
          );
        const pointsEarned =
          answeredCorrectly && submission?.participantId === firstCorrectSubmission?.participantId
            ? 1
            : 0;

        // Calculate total score
        const totalResult = await this.prisma.roomParticipantEvent.aggregate({
          where: { roomParticipantId: participant.id },
          _sum: { value: true },
        });

        return {
          participantId: participant.id,
          nickname: participant.nickname,
          answeredCorrectly: answeredCorrectly || false,
          pointsEarned,
          totalScore: totalResult._sum.value || 0,
        };
      }),
    );

    // Sort by total score descending
    scores.sort((a, b) => b.totalScore - a.totalScore);

    const answerRevealed: AnswerRevealedPayload = {
      questionId,
      correctAnswerId: question.correctAnswerId || undefined,
      correctAnswerText: question.correctAnswer?.value,
      correctAnswerValue: question.correctAnswer?.value || '',
      firstCorrectParticipant,
    };

    const scoresUpdate: ScoresUpdatePayload = {
      questionId,
      scores,
    };

    // Clear submissions for next question
    roomState.currentQuestionId = null;
    roomState.submissions.clear();

    return { answerRevealed, scoresUpdate };
  }

  // ============================================================================
  // Quiz Lifecycle
  // ============================================================================

  async getQuizStartedPayload(roomId: string): Promise<QuizStartedPayload> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.startedAt) {
      throw new Error('Room not started');
    }

    return {
      roomId,
      startedAt: room.startedAt.toISOString(),
    };
  }

  async getQuizEndedPayload(roomId: string): Promise<QuizEndedPayload> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.endedAt) {
      throw new Error('Room not ended');
    }

    return {
      roomId,
      endedAt: room.endedAt.toISOString(),
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private checkAnswerCorrect(
    submission: AnswerSubmission,
    correctAnswerId?: string | null,
    correctAnswerText?: string,
  ): boolean {
    if (submission.answerId) {
      return submission.answerId === correctAnswerId;
    }
    if (submission.answerText && correctAnswerText) {
      // Case-insensitive comparison, trimmed
      return (
        submission.answerText.trim().toLowerCase() ===
        correctAnswerText.trim().toLowerCase()
      );
    }
    return false;
  }

  private mapQuestionType(type: PrismaQuestionType): QuestionType {
    switch (type) {
      case PrismaQuestionType.MULTIPLE_CHOICE:
        return 'MULTIPLE_CHOICE';
      case PrismaQuestionType.TRUE_OR_FALSE:
        return 'TRUE_OR_FALSE';
      case PrismaQuestionType.IDENTIFICATION:
        return 'IDENTIFICATION';
      default:
        return 'MULTIPLE_CHOICE';
    }
  }
}
