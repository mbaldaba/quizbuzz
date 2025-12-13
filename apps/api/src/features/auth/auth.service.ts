import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionResponseDto } from './dto/session-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<SessionResponseDto> {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user type is TEMPORARY
    if (user.type === UserType.TEMPORARY) {
      throw new ForbiddenException(
        'Temporary users are not allowed to log in',
      );
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get session expiry days from config or default to 7
    const expiryDays = this.config.get<number>('SESSION_EXPIRY_DAYS') ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Create session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    return {
      id: user.id,
      username: user.username,
      type: user.type,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    };
  }

  async getSession(sessionId: string): Promise<SessionResponseDto | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      return null;
    }

    return {
      id: session.user.id,
      username: session.user.username,
      type: session.user.type,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    };
  }

  async logout(sessionId: string): Promise<void> {
    // Delete session if it exists (idempotent)
    // Use deleteMany instead of delete to avoid throwing if session doesn't exist
    await this.prisma.session.deleteMany({
      where: { id: sessionId },
    });
  }
}
