import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({
    status: 403,
    description: 'Temporary users are not allowed to log in',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponseDto> {
    const session = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );

    // Calculate cookie max age (7 days by default)
    const expiryDays = this.config.get<number>('SESSION_EXPIRY_DAYS') || 7;
    const maxAge = expiryDays * 24 * 60 * 60 * 1000; // Convert to milliseconds

    // Set signed cookie
    res.cookie('sessionId', session.sessionId, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
      signed: true,
    });

    return session;
  }

  @Get('session')
  @ApiOperation({ summary: 'Get current session details' })
  @ApiResponse({
    status: 200,
    description: 'Current session details',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or session expired' })
  async getSession(@Req() req: Request): Promise<SessionResponseDto> {
    const sessionId = req.signedCookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    const session = await this.authService.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'No session found' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const sessionId = req.signedCookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    await this.authService.logout(sessionId);

    // Clear cookie
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      signed: true,
    });

    return { message: 'Successfully logged out' };
  }
}
