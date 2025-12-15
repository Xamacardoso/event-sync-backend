import { EventState } from './event-state.interface';
import { EventContext } from '../event-context';
import { CanceledState } from './canceled.state';
import { FinishedState } from './finished.state';
import { BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from '../../../presentation/dtos/event.dto';

export class PublishedState implements EventState {
    constructor(private context: EventContext) { }

    publish(): void {
        throw new BadRequestException('Event is already published.');
    }

    cancel(): void {
        this.context.setState(new CanceledState(this.context));
    }

    finish(): void {
        this.context.setState(new FinishedState(this.context));
    }

    update(dto: UpdateEventDto): void {
        // Allowed to update details while published
    }

    revertToDraft(): void {
        const { DraftState } = require('./draft.state'); // Lazy load to avoid circular dependency
        this.context.setState(new DraftState(this.context));
    }

    getStatus(): 'published' {
        return 'published';
    }
}
