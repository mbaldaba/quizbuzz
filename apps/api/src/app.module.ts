import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { QuestionsModule } from './features/questions/questions.module';
import { RoomsModule } from './features/rooms/rooms.module';
import { ParticipantsModule } from './features/participants/participants.module';
import { QuizmasterModule } from './features/quizmaster/quizmaster.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    AuthModule,
    QuestionsModule,
    RoomsModule,
    ParticipantsModule,
    QuizmasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
