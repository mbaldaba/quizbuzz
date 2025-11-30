import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class NextQuestionDto {
  @ApiProperty({
    description: 'Room ID to add the next question to',
    example: 'clhxyz123abc456',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
