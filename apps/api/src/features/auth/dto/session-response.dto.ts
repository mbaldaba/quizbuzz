import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class SessionResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clxxxxxxxxxxxx',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'admin123',
  })
  username: string;

  @ApiProperty({
    description: 'User type',
    enum: UserType,
    example: UserType.ADMIN,
  })
  type: UserType;

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
