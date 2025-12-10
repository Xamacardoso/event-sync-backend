import { Module } from '@nestjs/common';
import { EventsController } from '../../presentation/controllers/events.controller';
import { EventsService } from '../../application/services/events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}