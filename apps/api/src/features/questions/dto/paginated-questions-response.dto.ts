import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { QuestionResponseDto } from './question-response.dto';

export class PaginatedQuestionsResponseDto extends PaginatedResponseDto<QuestionResponseDto> {
  @ApiProperty({
    description: 'Array of questions',
    type: [QuestionResponseDto],
  })
  data: QuestionResponseDto[];
}
