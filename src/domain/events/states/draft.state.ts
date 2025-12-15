import { EventState } from './event-state.interface';
import { EventContext } from '../event-context';
import { PublishedState } from './published.state';
import { CanceledState } from './canceled.state';
import { BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from '../../../presentation/dtos/event.dto';

export class DraftState implements EventState {
    constructor(private context: EventContext) { }

    publish(): void {
        this.context.setState(new PublishedState(this.context));
    }

    cancel(): void {
        this.context.setState(new CanceledState(this.context));
    }

    finish(): void {
        throw new BadRequestException('Cannot finish a draft event.');
    }

    update(dto: UpdateEventDto): void {
        // Allowed
    }

    revertToDraft(): void {
        throw new BadRequestException('Event is already a draft.');
    }

    getStatus(): 'draft' {
        return 'draft';
    }
}
