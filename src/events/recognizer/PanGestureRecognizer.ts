import { GestureRecognizer, State } from "./GestureRecognizer"
import { FramerEventSession } from "../FramerEventSession"
import { FramerEvent } from "../FramerEvent"

/**
 * @internal
 */
export class PanGestureRecognizer extends GestureRecognizer {
    private startEvent: FramerEvent | null
    readonly eventType = "pan"

    pointerSessionBegan(session: FramerEventSession, event: FramerEvent) {
        this.recognize(session, event)
    }
    pointerSessionMoved(session: FramerEventSession, event: FramerEvent) {
        this.recognize(session, event)
    }
    pointerSessionEnded(session: FramerEventSession, event: FramerEvent) {
        this.panend(event)
    }

    recognize(session: FramerEventSession, event: FramerEvent) {
        if (Math.abs(event.delta.x) > 0 || Math.abs(event.delta.y) > 0) {
            if (this.startEvent) {
                this.pan(event)
            } else {
                this.panstart(event)
            }
        }
    }

    reset() {
        this.startEvent = null
        super.reset()
    }

    panstart(event: FramerEvent) {
        if (!this.hasState(State.Possible) || (event.isLeftMouseClick !== undefined && !event.isLeftMouseClick)) {
            return
        }
        this.stateSwitch(State.Began)
        this.startEvent = event
        if (this.handler && this.startEvent.target) {
            this.handler.gestureBegan(this.eventType, event, this.startEvent.target)
        }
    }

    pan(event: FramerEvent) {
        if (!this.hasState(State.Began | State.Changed)) {
            return
        }
        if (!this.startEvent) {
            return
        }
        this.stateSwitch(State.Changed)
        if (this.handler && this.startEvent.target) {
            this.handler.gestureChanged(this.eventType, event, this.startEvent.target)
        }
    }

    panend(event: FramerEvent) {
        if (!this.hasState(State.Began | State.Changed)) {
            return
        }
        if (!this.startEvent) {
            return
        }
        this.stateSwitch(State.Ended)
        if (this.handler && this.startEvent.target) {
            this.handler.gestureEnded(this.eventType, event, this.startEvent.target)
        }
    }
}
