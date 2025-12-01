import { Module } from '@nestjs/common';
import { QuizmasterController } from './quizmaster.controller';
import { QuizmasterService } from './quizmaster.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [QuizmasterController],
  providers: [QuizmasterService],
  exports: [QuizmasterService],
})
export class QuizmasterModule {}
