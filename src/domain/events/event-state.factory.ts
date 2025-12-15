import { EventContext } from './event-context';
import { EventState } from './states/event-state.interface';
import { DraftState } from './states/draft.state';
import { PublishedState } from './states/published.state';
import { FinishedState } from './states/finished.state';
import { CanceledState } from './states/canceled.state';

export class EventStateFactory {
    static create(status: string, context: EventContext): EventState {
        switch (status) {
            case 'published': return new PublishedState(context);
            case 'finished': return new FinishedState(context);
            case 'canceled': return new CanceledState(context);
            case 'draft':
            default: return new DraftState(context);
        }
    }
}
