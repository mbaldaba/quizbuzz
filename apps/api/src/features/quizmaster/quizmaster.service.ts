import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { RoomStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { EventsGateway } from '../events/events.gateway';
import { NextQuestionDto } from './dto/next-question.dto';
import { NextQuestionResponseDto } from './dto/next-question-response.dto';
import { RevealAnswerDto } from './dto/reveal-answer.dto';
import { RevealAnswerResponseDto } from './dto/reveal-answer-response.dto';

@Injectable()
export class QuizmasterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

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

    // Broadcast NEXT_QUESTION event to all participants in the room
    const nextQuestionPayload = await this.eventsService.startQuestion(
      roomId,
      selectedQuestion.id,
    );
    this.eventsGateway.broadcastNextQuestion(roomId, nextQuestionPayload);

    return {
      id: selectedQuestion.id,
      type: selectedQuestion.type,
      description: selectedQuestion.description,
      choices: selectedQuestion.choices,
      roomId,
      roomQuestionId: roomQuestion.id,
    };
  }

  async revealAnswer(
    revealAnswerDto: RevealAnswerDto,
  ): Promise<RevealAnswerResponseDto> {
    const { roomId, questionId } = revealAnswerDto;

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
    // Reveal answer is handled by EventsService
    // This will evaluate all submissions and return payloads
    const { answerRevealed, scoresUpdate } =
      await this.eventsService.revealAnswer(roomId, questionId);

    // Broadcast events to all participants in the room
    this.eventsGateway.broadcastAnswerRevealed(roomId, answerRevealed);
    this.eventsGateway.broadcastScoresUpdate(roomId, scoresUpdate);

    return {
      questionId,
      revealed: true,
      message: 'Answer revealed and scores updated',
    };
  }
}
