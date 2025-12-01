import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RevealAnswerDto {
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
}
