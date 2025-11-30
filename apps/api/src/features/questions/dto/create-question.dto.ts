import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';
import { QuestionChoiceDto } from './question-choice.dto';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'Array of choices. Must be 4 for MULTIPLE_CHOICE, 1 for IDENTIFICATION, 2 for TRUE_OR_FALSE (one "True" and one "False")',
    type: [QuestionChoiceDto],
    example: [
      { value: 'Paris', isCorrect: true },
      { value: 'London', isCorrect: false },
      { value: 'Berlin', isCorrect: false },
      { value: 'Madrid', isCorrect: false },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionChoiceDto)
  choices: QuestionChoiceDto[];
}
