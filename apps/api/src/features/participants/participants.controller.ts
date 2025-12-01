import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { ParticipantsService, JoinRoomResult } from './participants.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { ParticipantResponseDto } from './dto/participant-response.dto';

@ApiTags('participants')
@Controller('participants')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly jwtService: JwtService,
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
  ): Promise<ParticipantResponseDto> {
    const result: JoinRoomResult = await this.participantsService.joinRoom(
      joinRoomDto.roomId,
      joinRoomDto.nickname,
      joinRoomDto.password,
    );

    // Generate JWT token
    const token = this.jwtService.sign({
      sessionId: result.sessionId,
      roomId: result.roomId,
    });

    // Return participant data with token, excluding sessionId
    return {
      id: result.id,
      roomId: result.roomId,
      userId: result.userId,
      nickname: result.nickname,
      token,
      expiresAt: result.expiresAt,
    };
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a room (logout as participant)' })
  @ApiResponse({ status: 200, description: 'Successfully left the room' })
  @ApiResponse({ status: 401, description: 'No session found' })
  async leaveRoom(
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const sessionId = req.signedCookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    await this.participantsService.leaveRoom(sessionId);

    return { message: 'Successfully left the room' };
  }
}
