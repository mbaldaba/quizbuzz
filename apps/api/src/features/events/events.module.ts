import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiryDays = configService.get<number>('SESSION_EXPIRY_DAYS') ?? 7;
        return {
          secret: configService.get<string>('AUTH_SECRET'),
          signOptions: {
            expiresIn: `${expiryDays}d`,
          },
        };
      },
    }),
  ],
  providers: [EventsGateway, EventsService],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
