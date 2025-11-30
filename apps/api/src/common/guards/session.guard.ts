import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.signedCookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    // Find session and include user
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      throw new UnauthorizedException('Session expired');
    }

    // Attach user to request
    request.user = session.user;

    return true;
  }
}
