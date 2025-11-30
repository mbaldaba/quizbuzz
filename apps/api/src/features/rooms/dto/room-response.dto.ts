import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from '@prisma/client';

export class RoomResponseDto {
  @ApiProperty({
    description: 'Room ID',
    example: 'clh1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the room',
    example: 'Math Quiz Room',
  })
  title: string;

  @ApiProperty({
    description: 'Maximum number of players allowed',
    example: 10,
  })
  maxPlayers: number;

  @ApiProperty({
    description: 'Current status of the room',
    enum: RoomStatus,
    example: RoomStatus.CREATED,
  })
  status: RoomStatus;

  @ApiProperty({
    description: 'Whether the room has a password',
    example: true,
  })
  hasPassword: boolean;

  @ApiProperty({
    description: 'When the room was started',
    example: '2025-11-30T12:00:00.000Z',
    nullable: true,
  })
  startedAt: Date | null;

  @ApiProperty({
    description: 'When the room was ended',
    example: '2025-11-30T14:00:00.000Z',
    nullable: true,
  })
  endedAt: Date | null;

  @ApiProperty({
    description: 'User ID who created the room',
    example: 'clh1234567890',
  })
  createdById: string;

  @ApiProperty({
    description: 'When the room was created',
    example: '2025-11-30T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the room was last updated',
    example: '2025-11-30T12:00:00.000Z',
  })
  updatedAt: Date;
}
