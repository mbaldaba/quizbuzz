import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Title of the room',
    example: 'Math Quiz Room',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Maximum number of players allowed in the room',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  maxPlayers: number;

  @ApiProperty({
    description: 'Password for the room (optional)',
    example: 'secret123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
