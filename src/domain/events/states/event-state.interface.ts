
import { UpdateEventDto } from '../../../presentation/dtos/event.dto';

export interface EventState {
    publish(): void;
    cancel(): void;
    finish(): void;
    update(dto: UpdateEventDto): void;
    revertToDraft(): void;
    getStatus(): 'draft' | 'published' | 'canceled' | 'finished';
}
