import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('rooms')
@Controller('rooms')
@AdminOnly()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room (Admin only)' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({
    status: 201,
    description: 'Room successfully created',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: User,
  ): Promise<RoomResponseDto> {
    return this.roomsService.createRoom(createRoomDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of rooms (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async listRooms(
    @Query() query: ListRoomsQueryDto,
  ): Promise<PaginatedResponseDto<RoomResponseDto>> {
    return this.roomsService.listRooms(query.page ?? 1, query.perPage ?? 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 'clh1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Room retrieved successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoom(@Param('id') id: string): Promise<RoomResponseDto> {
    return this.roomsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 'clh1234567890',
  })
  @ApiResponse({
    status: 204,
    description: 'Room successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async deleteRoom(@Param('id') id: string): Promise<void> {
    return this.roomsService.deleteRoom(id);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start a room (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 'clh1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Room successfully started',
    type: RoomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Room status must be CREATED',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async startRoom(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<RoomResponseDto> {
    return this.roomsService.startRoom(id, user.id);
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'End a room (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Room ID',
    example: 'clh1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Room successfully ended',
    type: RoomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Room status must be ONGOING',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async endRoom(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<RoomResponseDto> {
    return this.roomsService.endRoom(id, user.id);
  }
}
