import {
  Controller,
  Post,
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
import { ParticipantsService } from './participants.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { ParticipantResponseDto } from './dto/participant-response.dto';

@ApiTags('participants')
@Controller('participants')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly config: ConfigService,
  ) {}

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a room as a participant' })
  @ApiBody({ type: JoinRoomDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the room',
    type: ParticipantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 401, description: 'Invalid room password' })
  async joinRoom(
    @Body() joinRoomDto: JoinRoomDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ParticipantResponseDto> {
    const participant = await this.participantsService.joinRoom(
      joinRoomDto.roomId,
      joinRoomDto.nickname,
      joinRoomDto.password,
    );

    // Calculate cookie max age (7 days by default)
    const expiryDays = this.config.get<number>('SESSION_EXPIRY_DAYS') ?? 7;
    const maxAge = expiryDays * 24 * 60 * 60 * 1000; // Convert to milliseconds

    // Set signed cookie
    res.cookie('sessionId', participant.sessionId, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
      signed: true,
    });

    return participant;
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a room (logout as participant)' })
  @ApiResponse({ status: 200, description: 'Successfully left the room' })
  @ApiResponse({ status: 401, description: 'No session found' })
  async leaveRoom(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const sessionId = req.signedCookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    await this.participantsService.leaveRoom(sessionId);

    // Clear cookie
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      signed: true,
    });

    return { message: 'Successfully left the room' };
  }
}
