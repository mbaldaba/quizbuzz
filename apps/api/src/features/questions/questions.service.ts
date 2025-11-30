import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { QuestionType, Question, QuestionChoice } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import {
  QuestionResponseDto,
  QuestionChoiceResponseDto,
} from './dto/question-response.dto';
import { PaginatedQuestionsResponseDto } from './dto/paginated-questions-response.dto';
import { QuestionChoiceDto } from './dto/question-choice.dto';

interface GetQuestionsQuery {
  page?: number;
  perPage?: number;
  type?: QuestionType;
  search?: string;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateQuestionChoices(
    type: QuestionType,
    choices: QuestionChoiceDto[],
  ): void {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE: {
        if (choices.length !== 4) {
          throw new BadRequestException(
            'Multiple choice questions must have exactly 4 choices',
          );
        }
        const correctCount = choices.filter((c) => c.isCorrect).length;
        if (correctCount !== 1) {
          throw new BadRequestException(
            'Multiple choice questions must have exactly 1 correct answer',
          );
        }
        break;
      }

      case QuestionType.IDENTIFICATION: {
        if (choices.length !== 1) {
          throw new BadRequestException(
            'Identification questions must have exactly 1 choice',
          );
        }
        if (!choices[0].isCorrect) {
          throw new BadRequestException(
            'Identification answer must be marked as correct',
          );
        }
        break;
      }

      case QuestionType.TRUE_OR_FALSE: {
        if (choices.length !== 2) {
          throw new BadRequestException(
            'True or False questions must have exactly 2 choices',
          );
        }

        // Check that one choice is "True" and one is "False" (case-insensitive)
        const values = choices.map((c) => c.value.toLowerCase());
        const hasTrue = values.filter((v) => v === 'true').length === 1;
        const hasFalse = values.filter((v) => v === 'false').length === 1;

        if (!hasTrue || !hasFalse) {
          throw new BadRequestException(
            'True or False questions must have exactly one "True" choice and one "False" choice',
          );
        }

        // Check that exactly one is marked as correct
        const correctCount = choices.filter((c) => c.isCorrect).length;
        if (correctCount !== 1) {
          throw new BadRequestException(
            'True or False questions must have exactly 1 correct answer',
          );
        }
        break;
      }

      default:
        throw new BadRequestException('Invalid question type');
    }
  }

  private mapQuestionToResponse(
    question: Question & {
      choices: QuestionChoice[];
      createdBy: { id: string; username: string };
      updatedBy: { id: string; username: string };
    },
  ): QuestionResponseDto {
    return {
      id: question.id,
      type: question.type,
      description: question.description,
      choices: question.choices.map(
        (choice): QuestionChoiceResponseDto => ({
          id: choice.id,
          value: choice.value,
          isCorrect: choice.id === question.correctAnswerId,
        }),
      ),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      createdBy: {
        id: question.createdBy.id,
        username: question.createdBy.username,
      },
      updatedBy: {
        id: question.updatedBy.id,
        username: question.updatedBy.username,
      },
    };
  }

  async create(
    createQuestionDto: CreateQuestionDto,
    userId: string,
  ): Promise<QuestionResponseDto> {
    // Validate choices based on question type
    this.validateQuestionChoices(
      createQuestionDto.type,
      createQuestionDto.choices,
    );

    // Prepare choices to create
    const choicesToCreate = createQuestionDto.choices;

    // Use transaction to create question and choices atomically
    const question = await this.prisma.$transaction(async (tx) => {
      // Create question first (without correctAnswerId)
      const newQuestion = await tx.question.create({
        data: {
          type: createQuestionDto.type,
          description: createQuestionDto.description,
          createdById: userId,
          updatedById: userId,
        },
      });

      // Create all choices
      const createdChoices = await Promise.all(
        choicesToCreate.map((choice) =>
          tx.questionChoice.create({
            data: {
              value: choice.value,
              questionId: newQuestion.id,
              createdById: userId,
              updatedById: userId,
            },
          }),
        ),
      );

      // Find the correct answer
      const correctIndex = choicesToCreate.findIndex((c) => c.isCorrect);
      const correctChoice = createdChoices[correctIndex];

      // Update question with correctAnswerId
      return tx.question.update({
        where: { id: newQuestion.id },
        data: { correctAnswerId: correctChoice.id },
        include: {
          choices: true,
          createdBy: { select: { id: true, username: true } },
          updatedBy: { select: { id: true, username: true } },
        },
      });
    });

    return this.mapQuestionToResponse(question);
  }

  async findAll(
    query: GetQuestionsQuery,
  ): Promise<PaginatedQuestionsResponseDto> {
    const page = query.page || 1;
    const perPage = Math.min(query.perPage || 10, 100); // Max 100 per page
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: {
      type?: QuestionType;
      description?: { contains: string; mode: 'insensitive' };
    } = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.description = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Get total count and questions in parallel
    const [total, questions] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip,
        take: perPage,
        include: {
          choices: true,
          createdBy: { select: { id: true, username: true } },
          updatedBy: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data = questions.map((q) => this.mapQuestionToResponse(q));

    return new PaginatedQuestionsResponseDto(data, total, page, perPage);
  }

  async findOne(id: string): Promise<QuestionResponseDto> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        choices: true,
        createdBy: { select: { id: true, username: true } },
        updatedBy: { select: { id: true, username: true } },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.mapQuestionToResponse(question);
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    userId: string,
  ): Promise<QuestionResponseDto> {
    // Check if question exists
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Determine the final type (use updated type or keep existing)
    const finalType = updateQuestionDto.type || existingQuestion.type;

    // If choices are being updated, validate them
    if (updateQuestionDto.choices !== undefined) {
      this.validateQuestionChoices(finalType, updateQuestionDto.choices);
    }

    // Prepare choices to create
    const choicesToCreate = updateQuestionDto.choices;

    // Use transaction to update question and choices atomically
    const question = await this.prisma.$transaction(async (tx) => {
      // If choices are being updated, delete old choices and create new ones
      if (choicesToCreate) {
        // Delete all existing choices
        await tx.questionChoice.deleteMany({
          where: { questionId: id },
        });

        // Create new choices
        const createdChoices = await Promise.all(
          choicesToCreate.map((choice) =>
            tx.questionChoice.create({
              data: {
                value: choice.value,
                questionId: id,
                createdById: userId,
                updatedById: userId,
              },
            }),
          ),
        );

        // Find the correct answer
        const correctIndex = choicesToCreate.findIndex((c) => c.isCorrect);
        const correctChoice = createdChoices[correctIndex];

        // Update question with new correctAnswerId
        return tx.question.update({
          where: { id },
          data: {
            type: updateQuestionDto.type,
            description: updateQuestionDto.description,
            correctAnswerId: correctChoice.id,
            updatedById: userId,
          },
          include: {
            choices: true,
            createdBy: { select: { id: true, username: true } },
            updatedBy: { select: { id: true, username: true } },
          },
        });
      } else {
        // Only update question fields, not choices
        return tx.question.update({
          where: { id },
          data: {
            type: updateQuestionDto.type,
            description: updateQuestionDto.description,
            updatedById: userId,
          },
          include: {
            choices: true,
            createdBy: { select: { id: true, username: true } },
            updatedBy: { select: { id: true, username: true } },
          },
        });
      }
    });

    return this.mapQuestionToResponse(question);
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check if question exists
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        roomQuestions: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Check if question is used in any room
    if (question.roomQuestions.length > 0) {
      throw new ConflictException(
        'Cannot delete question that is used in one or more rooms',
      );
    }

    // Delete question (cascade will handle choices)
    await this.prisma.question.delete({
      where: { id },
    });

    return { message: 'Question deleted successfully' };
  }
}
