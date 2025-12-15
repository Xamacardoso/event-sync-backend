import { EventState } from './event-state.interface';
import { EventContext } from '../event-context';
import { BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from '../../../presentation/dtos/event.dto';

export class FinishedState implements EventState {
    constructor(private context: EventContext) { }

    publish(): void {
        throw new BadRequestException('Event is already finished.');
    }

    cancel(): void {
        throw new BadRequestException('Event is finished.');
    }

    finish(): void {
        throw new BadRequestException('Event is already finished.');
    }

    update(dto: UpdateEventDto): void {
        throw new BadRequestException('Cannot update a finished event.');
    }

    revertToDraft(): void {
        throw new BadRequestException('Cannot revert a finished event to draft.');
    }

    getStatus(): 'finished' {
        return 'finished';
    }
}
