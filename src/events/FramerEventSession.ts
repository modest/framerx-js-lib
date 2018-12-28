import { Point } from "../render"

import { FramerEvent } from "./FramerEvent"
import { Loop, MainLoop } from "../core/Loop"
import { GestureRecognizer, GestureHandler } from "./recognizer/GestureRecognizer"
import { PanGestureRecognizer } from "./recognizer/PanGestureRecognizer"
import { TapGestureRecognizer } from "./recognizer/TapGestureRecognizer"
import { MouseWheelGestureRecognizer } from "./recognizer/MouseWheelGestureRecognizer"

export type EventDispatcher = ((type: string, event: FramerEvent, target: EventTarget) => void)

export type NativeEvent = MouseEvent | TouchEvent

/**
 * @alpha
 */
export class FramerEventSession implements GestureHandler {
    private events: FramerEvent[] = []
    private recognizers: GestureRecognizer[] = []
    private mouseWheelRecognizer = new MouseWheelGestureRecognizer()
    private dispatcher: EventDispatcher
    /**
     * @internal
     */
    originElement: HTMLElement

    get isStarted(): boolean {
        return this.events.length !== 0
    }

    get startEvent(): FramerEvent | null {
        if (this.isStarted) {
            return this.events[0]
        } else {
            return null
        }
    }

    get lastEvent(): FramerEvent | null {
        if (this.events.length > 0) {
            return this.events[this.events.length - 1]
        } else {
            return null
        }
    }

    constructor(dispatcher: EventDispatcher, customOrigin?: HTMLElement) {
        this.dispatcher = dispatcher
        if (customOrigin) {
            this.originElement = customOrigin
        } else {
            this.originElement = document.body
        }
        const pan = new PanGestureRecognizer()
        const tap = new TapGestureRecognizer()
        pan.handler = this
        tap.handler = this
        this.mouseWheelRecognizer.handler = this
        this.recognizers = [tap, pan]
    }

    // Event handling

    private processEvent(event: FramerEvent): FramerEvent {
        // const event = new FramerEvent(originalEvent, this)
        this.events.push(event)
        return event
    }

    pointerDown(event: FramerEvent) {
        if (this.isStarted) {
            return
        }

        this.processEvent(event)
        this.recognizers.map(r => {
            r.cancel()
            r.pointerSessionBegan(this, event)
        })
    }

    pointerMove(event: FramerEvent) {
        if (!this.isStarted) {
            return
        }

        this.processEvent(event)
        this.recognizers.map(r => {
            r.pointerSessionMoved(this, event)
        })
    }

    pointerUp(event: FramerEvent) {
        if (!this.isStarted) {
            return
        }
        this.processEvent(event)
        this.recognizers.map(r => {
            r.pointerSessionEnded(this, event)
        })
        this.events = []
        this.recognizers.map(r => {
            r.reset()
        })
    }

    mouseWheel(event: FramerEvent) {
        this.processEvent(event)
        this.mouseWheelRecognizer.mouseWheel(this, event)
    }

    private dispatch(type: string, event: FramerEvent, target: EventTarget | null = null) {
        const dispatchTarget = target || (this.startEvent && this.startEvent.target) || event.target
        if (dispatchTarget) {
            this.dispatcher(type, event, dispatchTarget)
        }
    }

    // Gesture Handler

    gestureBegan(type: string, event: FramerEvent, target: EventTarget | null) {
        this.dispatch(`${type}start`, event, target)
    }

    gestureChanged(type: string, event: FramerEvent, target: EventTarget | null) {
        this.dispatch(type, event, target)
    }
    gestureEnded(type: string, event: FramerEvent, target: EventTarget | null) {
        this.dispatch(`${type}end`, event, target)
    }

    // Calculatinos

    /**
     * Average velocity over last n seconds in pixels per second.
     * @param n - number of events to use for calculation
     */
    velocity(t = Loop.TimeStep * 2): Point {
        if (!this.isStarted || this.events.length < 2) {
            return { x: 0, y: 0 }
        }

        const events = this.events
        let i = events.length - 1
        let event: FramerEvent | null = null

        while (i >= 0) {
            event = events[i]
            if (MainLoop.time - event.loopTime > t) {
                break
            }
            i--
        }

        if (!event) {
            return { x: 0, y: 0 }
        }

        const current = events[events.length - 1]
        const time = (MainLoop.time - event.loopTime) * 1000
        if (time === 0) {
            return { x: 0, y: 0 }
        }

        const velocity = {
            x: (current.devicePoint.x - event.devicePoint.x) / time,
            y: (current.devicePoint.y - event.devicePoint.y) / time,
        }

        if (velocity.x === Infinity) {
            velocity.x = 0
        }
        if (velocity.y === Infinity) {
            velocity.y = 0
        }

        return velocity
    }

    offset(event: FramerEvent): Point {
        if (!this.startEvent) {
            return { x: 0, y: 0 }
        }

        // TODO: externalize:
        const subtract = (pointA: Point, pointB: Point): Point => {
            return {
                x: pointA.x - pointB.x,
                y: pointA.y - pointB.y,
            }
        }

        return subtract(event.devicePoint, this.startEvent.devicePoint)
    }
}
