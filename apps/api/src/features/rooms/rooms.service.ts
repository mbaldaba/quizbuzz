import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { RoomStatus, Room } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createRoom(
    createRoomDto: CreateRoomDto,
    userId: string,
  ): Promise<RoomResponseDto> {
    // Hash password if provided
    let hashedPassword: string | undefined;
    if (createRoomDto.password) {
      hashedPassword = await argon2.hash(createRoomDto.password);
    }

    const room = await this.prisma.room.create({
      data: {
        title: createRoomDto.title,
        maxPlayers: createRoomDto.maxPlayers,
        password: hashedPassword,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.toRoomResponse(room);
  }

  async listRooms(
    page: number,
    perPage: number,
  ): Promise<PaginatedResponseDto<RoomResponseDto>> {
    const skip = (page - 1) * perPage;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        skip,
        take: perPage,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.room.count(),
    ]);

    const roomResponses = rooms.map((room) => this.toRoomResponse(room));

    return new PaginatedResponseDto(roomResponses, total, page, perPage);
  }

  async deleteRoom(roomId: string): Promise<void> {
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  async startRoom(roomId: string, userId: string): Promise<RoomResponseDto> {
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Check if status is CREATED
    if (room.status !== RoomStatus.CREATED) {
      throw new BadRequestException(
        `Room status must be CREATED to start. Current status: ${room.status}`,
      );
    }

    // Update room status to ONGOING
    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: {
        status: RoomStatus.ONGOING,
        startedAt: new Date(),
        updatedById: userId,
      },
    });

    // Broadcast QUIZ_STARTED event
    const quizStartedPayload = await this.eventsService.getQuizStartedPayload(roomId);
    this.eventsGateway.broadcastQuizStarted(roomId, quizStartedPayload);

    return this.toRoomResponse(updatedRoom);
  }

  async endRoom(roomId: string, userId: string): Promise<RoomResponseDto> {
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Check if status is ONGOING
    if (room.status !== RoomStatus.ONGOING) {
      throw new BadRequestException(
        `Room status must be ONGOING to end. Current status: ${room.status}`,
      );
    }

    // Update room status to ENDED
    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: {
        status: RoomStatus.ENDED,
        endedAt: new Date(),
        updatedById: userId,
      },
    });

    // Broadcast QUIZ_ENDED event
    const quizEndedPayload = await this.eventsService.getQuizEndedPayload(roomId);
    this.eventsGateway.broadcastQuizEnded(roomId, quizEndedPayload);

    return this.toRoomResponse(updatedRoom);
  }

  private toRoomResponse(room: Room): RoomResponseDto {
    return {
      id: room.id,
      title: room.title,
      maxPlayers: room.maxPlayers,
      status: room.status,
      hasPassword: !!room.password,
      startedAt: room.startedAt,
      endedAt: room.endedAt,
      createdById: room.createdById,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
