import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EvaluateAnswerDto {
  @ApiProperty({
    description: 'Room ID',
    example: 'clhroom123',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Question ID',
    example: 'clhquestion456',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Participant ID (room participant ID, not user ID)',
    example: 'clhparticipant789',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({
    description: 'Answer ID (the question choice ID)',
    example: 'clhanswer012',
  })
  @IsString()
  @IsNotEmpty()
  answerId: string;
}
