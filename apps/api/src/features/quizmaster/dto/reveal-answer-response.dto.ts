import { ApiProperty } from '@nestjs/swagger';

export class RevealAnswerResponseDto {
  @ApiProperty({ example: 'clhquestion456' })
  questionId: string;

  @ApiProperty({ example: true })
  revealed: boolean;

  @ApiProperty({ example: 'Answer revealed and scores updated' })
  message: string;
}
