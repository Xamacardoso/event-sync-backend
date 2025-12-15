import { EventState } from './states/event-state.interface';
import { UpdateEventDto } from '../../presentation/dtos/event.dto';

export class EventContext {
    private state: EventState;

    constructor(
        public readonly event: any
    ) { }

    public setState(state: EventState): void {
        this.state = state;
        this.event.status = state.getStatus();
    }

    public publish(): void {
        this.state.publish();
    }

    public cancel(): void {
        this.state.cancel();
    }

    public finish(): void {
        this.state.finish();
    }

    public revertToDraft(): void {
        this.state.revertToDraft();
    }

    public update(dto: UpdateEventDto): void {
        this.state.update(dto);
        // Apply allowed updates
        // Note: The service will handle the actual DB persistence of these changes
        Object.assign(this.event, dto);
    }

    public getStatus(): string {
        return this.state.getStatus();
    }
}
