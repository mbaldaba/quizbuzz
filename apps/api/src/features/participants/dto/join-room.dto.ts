import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    description: 'Room ID to join',
    example: 'clxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Nickname for the participant',
    example: 'JohnDoe',
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    description: 'Room password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
