import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipantResponseDto } from './dto/participant-response.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async joinRoom(
    roomId: string,
    nickname: string,
    password: string,
  ): Promise<ParticipantResponseDto> {
    // Find the room
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Verify room password
    if (room.password) {
      const isPasswordValid = await argon2.verify(room.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid room password');
      }
    } else if (password) {
      // Room has no password but password was provided
      throw new UnauthorizedException('This room does not require a password');
    }

    // Check if participant already exists in the room
    let participant = await this.prisma.roomParticipant.findUnique({
      where: {
        roomId_nickname: {
          roomId,
          nickname,
        },
      },
    });

    // If participant doesn't exist, check if room is full
    if (!participant) {
      const participantCount = await this.prisma.roomParticipant.count({
        where: { roomId },
      });

      if (participantCount >= room.maxPlayers) {
        throw new BadRequestException('Room is full');
      }
    }

    let userId: string;

    if (participant) {
      // Participant exists, use existing user ID
      userId = participant.userId;
    } else {
      // Generate username for temporary user
      const username = `${roomId}.${nickname}`;

      // Hash the room password for the temporary user
      const hashedPassword = await argon2.hash(password);

      // Create new temporary user
      const user = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          type: UserType.TEMPORARY,
        },
      });

      userId = user.id;

      // Create room participant
      participant = await this.prisma.roomParticipant.create({
        data: {
          roomId,
          userId,
          nickname,
        },
      });
    }

    // Get session expiry days from config or default to 7
    const expiryDays = this.config.get<number>('SESSION_EXPIRY_DAYS') ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Create session for the temporary user
    const session = await this.prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });

    return {
      id: participant.id,
      roomId: participant.roomId,
      userId: participant.userId,
      nickname: participant.nickname,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    };
  }

  async leaveRoom(sessionId: string): Promise<void> {
    // Delete the session (logout)
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }
}
