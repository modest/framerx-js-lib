import { GestureRecognizer, State } from "./GestureRecognizer"
import { FramerEventSession } from "../FramerEventSession"
import { FramerEvent } from "../FramerEvent"
import { debounce } from "../../render"

/**
 * @internal
 */
export class MouseWheelGestureRecognizer extends GestureRecognizer {
    private startEvent: FramerEvent | null
    readonly eventType = "mousewheel"

    pointerSessionBegan(session: FramerEventSession, event: FramerEvent) {}
    pointerSessionMoved(session: FramerEventSession, event: FramerEvent) {}
    pointerSessionEnded(session: FramerEventSession, event: FramerEvent) {}

    mouseWheel(session: FramerEventSession, event: FramerEvent) {
        if (!this.handler) return

        if (this.hasState(State.Possible)) {
            this.startEvent = event
            this.stateSwitch(State.Began)
            this.handler.gestureBegan(this.eventType, event, this.startEvent.target)
            return
        }

        if (this.hasState(State.Began | State.Changed) && this.startEvent) {
            this.stateSwitch(State.Changed)
            this.handler.gestureChanged(this.eventType, event, this.startEvent.target)
        }
        this.onMouseWheelEnd(event)
    }

    private onMouseWheelEnd = debounce((event: FramerEvent) => {
        if (this.handler && this.startEvent) {
            this.stateSwitch(State.Ended)
            this.handler.gestureEnded(this.eventType, event, this.startEvent.target)
            this.startEvent = null
            this.reset()
        }
    }, 300)
}
