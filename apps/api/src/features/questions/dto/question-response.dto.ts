import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

export class QuestionChoiceResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the choice',
    example: 'clxxx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'The text value of the choice',
    example: 'Paris',
  })
  value: string;

  @ApiProperty({
    description: 'Whether this choice is the correct answer',
    example: true,
  })
  isCorrect: boolean;
}

export class QuestionUserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clxxx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'admin123',
  })
  username: string;
}

export class QuestionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the question',
    example: 'clxxx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
  })
  description: string;

  @ApiProperty({
    description: 'Array of choices for this question',
    type: [QuestionChoiceResponseDto],
  })
  choices: QuestionChoiceResponseDto[];

  @ApiProperty({
    description: 'Timestamp when the question was created',
    example: '2025-11-30T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the question was last updated',
    example: '2025-11-30T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User who created the question',
    type: QuestionUserInfoDto,
  })
  createdBy: QuestionUserInfoDto;

  @ApiProperty({
    description: 'User who last updated the question',
    type: QuestionUserInfoDto,
  })
  updatedBy: QuestionUserInfoDto;
}
