import { ApiProperty } from '@nestjs/swagger';

export class ParticipantResponseDto {
  @ApiProperty({
    description: 'Participant ID',
    example: 'clxxxxxxxxxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Room ID',
    example: 'clxxxxxxxxxxxx',
  })
  roomId: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clxxxxxxxxxxxx',
  })
  userId: string;

  @ApiProperty({
    description: 'Participant nickname',
    example: 'JohnDoe',
  })
  nickname: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'clxxxxxxxxxxxx',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Session expiration timestamp',
    example: '2025-12-07T12:00:00.000Z',
  })
  expiresAt: Date;
}
