import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RoomStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NextQuestionDto } from './dto/next-question.dto';
import { NextQuestionResponseDto } from './dto/next-question-response.dto';
import { EvaluateAnswerDto } from './dto/evaluate-answer.dto';
import { EvaluateResponseDto } from './dto/evaluate-response.dto';

@Injectable()
export class QuizmasterService {
  constructor(private readonly prisma: PrismaService) {}

  async nextQuestion(
    nextQuestionDto: NextQuestionDto,
  ): Promise<NextQuestionResponseDto> {
    const { roomId } = nextQuestionDto;

    // Verify room exists and is in ONGOING status
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    if (room.status !== RoomStatus.ONGOING) {
      throw new BadRequestException(
        `Room must be in ONGOING status. Current status: ${room.status}`,
      );
    }

    // Get all questions already used in this room
    const usedQuestions = await this.prisma.roomQuestion.findMany({
      where: { roomId },
      select: { questionId: true },
    });

    const usedQuestionIds = usedQuestions.map((rq) => rq.questionId);

    // Find a random question that hasn't been used yet
    const availableQuestions = await this.prisma.question.findMany({
      where: {
        id: {
          notIn: usedQuestionIds,
        },
      },
      include: {
        choices: {
          select: {
            id: true,
            value: true,
          },
        },
      },
      take: 5,
    });

    if (availableQuestions.length === 0) {
      throw new BadRequestException(
        'No more questions available in the question pool',
      );
    }

    // Select a random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];

    // Add question to room
    const roomQuestion = await this.prisma.roomQuestion.create({
      data: {
        roomId,
        questionId: selectedQuestion.id,
      },
    });

    return {
      id: selectedQuestion.id,
      type: selectedQuestion.type,
      description: selectedQuestion.description,
      choices: selectedQuestion.choices,
      roomId,
      roomQuestionId: roomQuestion.id,
    };
  }

  async evaluateAnswer(
    evaluateAnswerDto: EvaluateAnswerDto,
  ): Promise<EvaluateResponseDto> {
    const { roomId, questionId, participantId, answerId } = evaluateAnswerDto;

    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Verify question exists in the room
    const roomQuestion = await this.prisma.roomQuestion.findUnique({
      where: {
        roomId_questionId: {
          roomId,
          questionId,
        },
      },
    });

    if (!roomQuestion) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found in room ${roomId}`,
      );
    }

    // Verify participant exists in the room
    const participant = await this.prisma.roomParticipant.findUnique({
      where: { id: participantId },
      include: {
        room: true,
      },
    });

    if (!participant) {
      throw new NotFoundException(
        `Participant with ID ${participantId} not found`,
      );
    }

    if (participant.roomId !== roomId) {
      throw new BadRequestException(
        `Participant ${participantId} is not in room ${roomId}`,
      );
    }

    // Get question with correct answer
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        choices: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Verify answer exists and belongs to this question
    const selectedChoice = question.choices.find((c) => c.id === answerId);

    if (!selectedChoice) {
      throw new BadRequestException(
        `Answer with ID ${answerId} is not a valid choice for question ${questionId}`,
      );
    }

    // Check if answer is correct
    const isCorrect = answerId === question.correctAnswerId;
    const pointsAwarded = isCorrect ? 1 : 0;

    // Create or update participant event
    const event = await this.prisma.roomParticipantEvent.upsert({
      where: {
        roomParticipantId_questionId: {
          roomParticipantId: participantId,
          questionId,
        },
      },
      create: {
        roomParticipantId: participantId,
        questionId,
        selectedChoiceId: answerId,
        value: pointsAwarded,
      },
      update: {
        selectedChoiceId: answerId,
        value: pointsAwarded,
      },
    });

    // Calculate total points for this participant
    const totalPointsResult = await this.prisma.roomParticipantEvent.aggregate({
      where: {
        roomParticipantId: participantId,
      },
      _sum: {
        value: true,
      },
    });

    const totalPoints = totalPointsResult._sum.value ?? 0;

    return {
      eventId: event.id,
      participantId,
      participantNickname: participant.nickname,
      questionId,
      questionDescription: question.description,
      selectedAnswerId: answerId,
      selectedAnswerValue: selectedChoice.value,
      isCorrect,
      pointsAwarded,
      totalPoints,
    };
  }
}
