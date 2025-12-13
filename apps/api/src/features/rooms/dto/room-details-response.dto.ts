import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus, QuestionType } from '@prisma/client';

export class RoomQuestionChoiceDto {
  @ApiProperty({
    description: 'Unique identifier of the choice',
    example: 'clxxx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'The text value of the choice',
    example: 'Paris',
  })
  value: string;

  @ApiProperty({
    description: 'Whether this choice is the correct answer',
    example: true,
  })
  isCorrect: boolean;
}

export class RoomQuestionDto {
  @ApiProperty({
    description: 'Unique identifier of the question',
    example: 'clxxx123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?',
  })
  description: string;

  @ApiProperty({
    description: 'The ID of the correct answer',
    example: 'clxxx123456789',
    nullable: true,
  })
  correctAnswerId: string | null;

  @ApiProperty({
    description: 'Array of choices for this question',
    type: [RoomQuestionChoiceDto],
  })
  choices: RoomQuestionChoiceDto[];
}

export class RoomDetailsResponseDto {
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
    description: 'ID of the user who created the room',
    example: 'clxxx123456789',
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

  @ApiProperty({
    description: 'Questions in the room, ordered by their order in the room. Last question is the current question.',
    type: [RoomQuestionDto],
  })
  questions: RoomQuestionDto[];
}
