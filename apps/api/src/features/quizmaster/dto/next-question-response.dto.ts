import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

class QuestionChoiceDto {
  @ApiProperty({ example: 'clhxyz123abc456' })
  id: string;

  @ApiProperty({ example: 'Paris' })
  value: string;
}

export class NextQuestionResponseDto {
  @ApiProperty({ example: 'clhxyz123abc456' })
  id: string;

  @ApiProperty({ 
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE 
  })
  type: QuestionType;

  @ApiProperty({ example: 'What is the capital of France?' })
  description: string;

  @ApiProperty({ 
    type: [QuestionChoiceDto],
    description: 'Available answer choices'
  })
  choices: QuestionChoiceDto[];

  @ApiProperty({ example: 'clhroom123' })
  roomId: string;

  @ApiProperty({ example: 'clhroomq456' })
  roomQuestionId: string;
}
