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
import { RevealAnswerDto } from './dto/reveal-answer.dto';
import { RevealAnswerResponseDto } from './dto/reveal-answer-response.dto';
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

  @Post('reveal-answer')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reveal the answer and calculate scores',
    description: 'Reveals the correct answer, evaluates all submissions, and awards 1 point to the first correct answer. Broadcasts results via Socket.IO.'
  })
  @ApiBody({ type: RevealAnswerDto })
  @ApiResponse({
    status: 200,
    description: 'Answer revealed and scores updated',
    type: RevealAnswerResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Question not active in room' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ 
    status: 404, 
    description: 'Room or question not found' 
  })
  async revealAnswer(
    @Body() revealAnswerDto: RevealAnswerDto,
  ): Promise<RevealAnswerResponseDto> {
    return this.quizmasterService.revealAnswer(revealAnswerDto);
  }
}
