import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';
import type { User } from '@prisma/client';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { PaginatedQuestionsResponseDto } from './dto/paginated-questions-response.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new question with choices' })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
    type: QuestionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error',
  })
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: User,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.create(createQuestionDto, user.id);
  }

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Get paginated list of questions' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: QuestionType,
    description: 'Filter by question type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in question description',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of questions',
    type: PaginatedQuestionsResponseDto,
  })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('type') type?: QuestionType,
    @Query('search') search?: string,
  ): Promise<PaginatedQuestionsResponseDto> {
    return this.questionsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
      type,
      search,
    });
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({
    name: 'id',
    description: 'Question ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Question details',
    type: QuestionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  async findOne(@Param('id') id: string): Promise<QuestionResponseDto> {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a question and its choices' })
  @ApiParam({
    name: 'id',
    description: 'Question ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    type: QuestionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser() user: User,
  ): Promise<QuestionResponseDto> {
    return this.questionsService.update(id, updateQuestionDto, user.id);
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({
    name: 'id',
    description: 'Question ID',
    example: 'clxxx123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Question deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Question deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete question that is used in rooms',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.questionsService.remove(id);
  }
}
