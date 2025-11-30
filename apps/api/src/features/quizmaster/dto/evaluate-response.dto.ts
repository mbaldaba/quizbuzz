import { ApiProperty } from '@nestjs/swagger';

export class EvaluateResponseDto {
  @ApiProperty({ example: 'clhevent123' })
  eventId: string;

  @ApiProperty({ example: 'clhparticipant789' })
  participantId: string;

  @ApiProperty({ example: 'John Doe' })
  participantNickname: string;

  @ApiProperty({ example: 'clhquestion456' })
  questionId: string;

  @ApiProperty({ example: 'What is the capital of France?' })
  questionDescription: string;

  @ApiProperty({ example: 'clhanswer012' })
  selectedAnswerId: string;

  @ApiProperty({ example: 'Paris' })
  selectedAnswerValue: string;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ 
    example: 1,
    description: 'Points awarded: 1 for correct, 0 for incorrect' 
  })
  pointsAwarded: number;

  @ApiProperty({ 
    example: 5,
    description: 'Total points for this participant after this answer' 
  })
  totalPoints: number;
}
