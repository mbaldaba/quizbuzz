import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';
import { QuestionChoiceDto } from './question-choice.dto';

export class UpdateQuestionDto {
  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
    required: false,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'Array of choices. Must be 4 for MULTIPLE_CHOICE, 1 for IDENTIFICATION, 2 for TRUE_OR_FALSE (one "True" and one "False")',
    type: [QuestionChoiceDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionChoiceDto)
  @IsOptional()
  choices?: QuestionChoiceDto[];
}
