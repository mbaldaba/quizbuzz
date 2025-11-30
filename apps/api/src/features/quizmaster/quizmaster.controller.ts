import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { QuizmasterService } from './quizmaster.service';
import { NextQuestionDto } from './dto/next-question.dto';
import { NextQuestionResponseDto } from './dto/next-question-response.dto';
import { EvaluateAnswerDto } from './dto/evaluate-answer.dto';
import { EvaluateResponseDto } from './dto/evaluate-response.dto';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';

@ApiTags('quizmaster')
@Controller('quizmaster')
export class QuizmasterController {
  constructor(private readonly quizmasterService: QuizmasterService) {}

  @Post('next-question')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Add a random question from the question bank to a room',
    description: 'Adds a random question that has not been used in the room yet. Room must be in ONGOING status.'
  })
  @ApiBody({ type: NextQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'Question successfully added to room',
    type: NextQuestionResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Room not in ONGOING status or no questions available' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async nextQuestion(
    @Body() nextQuestionDto: NextQuestionDto,
  ): Promise<NextQuestionResponseDto> {
    return this.quizmasterService.nextQuestion(nextQuestionDto);
  }

  @Post('evaluate')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Evaluate a participant\'s answer and assign points',
    description: 'Evaluates if the participant\'s answer is correct and assigns 1 point if correct, 0 if incorrect. Creates or updates the participant event.'
  })
  @ApiBody({ type: EvaluateAnswerDto })
  @ApiResponse({
    status: 200,
    description: 'Answer successfully evaluated',
    type: EvaluateResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid answer or participant not in room' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ 
    status: 404, 
    description: 'Room, question, or participant not found' 
  })
  async evaluateAnswer(
    @Body() evaluateAnswerDto: EvaluateAnswerDto,
  ): Promise<EvaluateResponseDto> {
    return this.quizmasterService.evaluateAnswer(evaluateAnswerDto);
  }
}
