import { EventState } from './event-state.interface';
import { EventContext } from '../event-context';
import { BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from '../../../presentation/dtos/event.dto';

export class CanceledState implements EventState {
    constructor(private context: EventContext) { }

    publish(): void {
        throw new BadRequestException('Event is canceled.');
    }

    cancel(): void {
        throw new BadRequestException('Event is already canceled.');
    }

    finish(): void {
        throw new BadRequestException('Event is canceled.');
    }

    update(dto: UpdateEventDto): void {
        throw new BadRequestException('Cannot update a canceled event.');
    }

    revertToDraft(): void {
        const { DraftState } = require('./draft.state');
        this.context.setState(new DraftState(this.context));
    }

    getStatus(): 'canceled' {
        return 'canceled';
    }
}
