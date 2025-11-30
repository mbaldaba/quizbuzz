import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class QuestionChoiceDto {
  @ApiProperty({
    description: 'The text value of the choice',
    example: 'Paris',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description:
      'Whether this choice is the correct answer (required for MULTIPLE_CHOICE and IDENTIFICATION, ignored for TRUE_OR_FALSE)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}
