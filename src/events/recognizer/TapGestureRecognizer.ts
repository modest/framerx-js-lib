import { GestureRecognizer, GestureHandler, State } from "./GestureRecognizer"
import { FramerEventSession } from "../FramerEventSession"
import { FramerEvent } from "../FramerEvent"

/**
 * @internal
 */
export class TapGestureRecognizer extends GestureRecognizer {
    readonly eventType = "tap"
    handler: GestureHandler | null

    pointerSessionBegan(session: FramerEventSession, event: FramerEvent) {
        if (this.handler && event.isLeftMouseClick !== undefined && event.isLeftMouseClick) {
            this.handler.gestureBegan(this.eventType, event, null)
        }
    }
    pointerSessionMoved(session: FramerEventSession, event: FramerEvent) {}
    pointerSessionEnded(session: FramerEventSession, event: FramerEvent) {
        if (this.isPrevented) {
            this.stateSwitch(State.Failed)
        } else if (!session.startEvent || session.startEvent.target === event.target) {
            this.stateSwitch(State.Recognized)
            if (this.handler) {
                this.handler.gestureChanged(this.eventType, event, null)
            }
        } else {
            this.stateSwitch(State.Failed)
        }
        if (this.handler) {
            this.handler.gestureEnded(this.eventType, event, null)
        }
    }
}
