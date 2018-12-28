import { FramerEvent } from "../FramerEvent"
import { FramerEventSession } from "../FramerEventSession"

/**
 * @internal
 */
export enum State {
    Possible = 1 << 1, // 2
    Began = 1 << 2, // 4
    Changed = 1 << 3, // 8
    Ended = 1 << 4, // 16
    Failed = 1 << 5, // 32
    Cancelled = 1 << 6, // 64
    Recognized = 1 << 7, // 128
}

function stateName(state: State): string {
    switch (state) {
        case State.Possible:
            return "Possible"
        case State.Began:
            return "Began"
        case State.Changed:
            return "Changed"
        case State.Ended:
            return "Ended"
        case State.Failed:
            return "Failed"
        case State.Cancelled:
            return "Cancelled"
        case State.Recognized:
            return "Recognized"
        default:
            return "Unknown"
    }
}

function containsBitmask(value: number, bitmask: number): boolean {
    return (value & bitmask) !== 0
}

/**
 * @internal
 */
export abstract class GestureRecognizer {
    private _state: State = State.Possible

    get state(): State {
        return this._state
    }
    private setState(state: State) {
        this._state = state
    }
    handler: GestureHandler | null
    preventers: GestureRecognizer[] = []
    get isPrevented(): boolean {
        let prevented = false
        for (const recognizer of this.preventers) {
            if (recognizer.state & (State.Began | State.Changed | State.Ended)) {
                prevented = true
                break
            }
        }
        return prevented
    }

    abstract pointerSessionBegan(session: FramerEventSession, event: FramerEvent): void
    abstract pointerSessionMoved(session: FramerEventSession, event: FramerEvent): void
    abstract pointerSessionEnded(session: FramerEventSession, event: FramerEvent): void

    canBePreventedBy(recognizer: GestureRecognizer) {
        this.preventers.push(recognizer)
    }

    hasState(bitmask: State) {
        return containsBitmask(this.state, bitmask)
    }

    stateSwitch(newState: State) {
        let allowedStates: State
        switch (this.state) {
            case State.Possible:
                allowedStates = State.Began | State.Recognized | State.Failed
                break
            case State.Began:
                allowedStates = State.Changed | State.Cancelled | State.Ended
                break
            case State.Changed:
                allowedStates = State.Changed | State.Cancelled | State.Ended
                break
            case State.Recognized:
            case State.Ended:
            case State.Cancelled:
            case State.Failed:
                allowedStates = State.Possible
                break
            default:
                allowedStates = 0
        }
        if (!containsBitmask(newState, allowedStates)) {
            // tslint:disable-next-line:no-console
            console.warn(`Unallowed state change from ${stateName(this.state)} to ${stateName(newState)}`)
            return
        }
        this.setState(newState)
    }

    cancel() {
        if (this.hasState(State.Began | State.Changed)) {
            this.setState(State.Cancelled)
        }
        this.reset()
    }

    reset() {
        if (!this.hasState(State.Possible)) {
            this.stateSwitch(State.Possible)
        }
    }
}

/**
 * @internal
 */
export interface GestureHandler {
    gestureBegan: (type: string, event: FramerEvent, target: EventTarget | null) => void
    gestureChanged: (type: string, event: FramerEvent, target: EventTarget | null) => void
    gestureEnded: (type: string, event: FramerEvent, target: EventTarget | null) => void
}
