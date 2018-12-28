import * as React from "react"
import { FramerEvent } from "../../events/FramerEvent"
import { DraggingContext } from "./WithDragging"

const hoistNonReactStatic = require("hoist-non-react-statics")

export type EventHandler = (event: FramerEvent) => void

export interface WithPanHandlers {
    onPanStart: EventHandler
    onPan: EventHandler
    onPanEnd: EventHandler
}

export interface WithTapHandlers {
    onTapStart: EventHandler
    onTap: EventHandler
    onTapEnd: EventHandler
}

export interface WithMouseHandlers {
    onMouseDown: EventHandler
    onClick: EventHandler
    onMouseUp: EventHandler
    onMouseEnter: EventHandler
    onMouseLeave: EventHandler
}

export interface WithMouseWheelHandler {
    onMouseWheelStart: EventHandler
    onMouseWheel: EventHandler
    onMouseWheelEnd: EventHandler
}

export interface WithEventsProperties
    extends WithPanHandlers,
        WithTapHandlers,
        WithMouseHandlers,
        WithMouseWheelHandler {}

export interface WithElement {
    element: HTMLElement | null
}

export interface MayHaveStyle {
    style?: React.CSSProperties
}

const hoverProps = {
    onMouseEnter: "mouseenter",
    onMouseLeave: "mouseleave",
}

const hoverEventKeys = Object.keys(hoverProps)

type HoverEventPropKey = keyof typeof hoverProps

type PointerEventHandler = (e: MouseEvent | TouchEvent) => void

const eventHandlerMapping = {
    panstart: ["onPanStart"],
    pan: ["onPan"],
    panend: ["onPanEnd"],
    tapstart: ["onTapStart", "onMouseDown"],
    tap: ["onTap", "onClick"],
    tapend: ["onTapEnd", "onMouseUp"],
    mousewheelstart: ["onMouseWheelStart"],
    mousewheel: ["onMouseWheel"],
    mousewheelend: ["onMouseWheelEnd"],
}

const tapEventKeys = new Set(["tapstart", "tap", "tapend"])

export function WithEvents<T, BaseProps extends React.ClassAttributes<T> & MayHaveStyle>(
    BaseComponent: React.ComponentType<BaseProps>
): React.ComponentClass<BaseProps & Partial<WithEventsProperties>> {
    type ExtendedProps = BaseProps & Partial<WithEventsProperties>
    type BaseComponentTypeRef = React.RefObject<typeof BaseComponent & WithElement & MayHaveStyle>

    const withEvents = class WithEventsHOC extends React.Component<ExtendedProps> {
        static defaultProps: BaseProps & Partial<WithEventsProperties> = Object.assign(
            {},
            BaseComponent.defaultProps as BaseProps
        )

        // This local variable is used to track if we should ignore a tap after a drag
        // It's not in a state because we want to change it from the render function (so not cause a render)
        shouldCancelTap = false

        activeEventListeners = new Map<HoverEventPropKey, PointerEventHandler>()

        props: ExtendedProps

        get element() {
            return this.component.current && this.component.current.element
        }

        componentDidMount() {
            if (!this.element) return

            this.element.addEventListener("FramerEvent", (event: any) => {
                const type = event["detail"]["type"] as keyof typeof eventHandlerMapping
                const framerEvent = event["detail"]["event"] as FramerEvent

                this.handleFramerEvent(type, framerEvent)
            })

            hoverEventKeys.forEach((eventName: HoverEventPropKey) => this.addEvent(eventName))
        }

        componentDidUpdate(prevProps: ExtendedProps) {
            hoverEventKeys.forEach((eventName: HoverEventPropKey) => this.checkEvent(eventName, prevProps))
        }

        componentWillUnmount() {
            hoverEventKeys.forEach((eventName: HoverEventPropKey) => this.removeEvent(eventName))
        }

        handleFramerEvent(type: keyof typeof eventHandlerMapping, framerEvent: FramerEvent) {
            const eventListenerKeys = eventHandlerMapping[type]
            if (!eventListenerKeys) return

            eventListenerKeys.forEach((eventKey: string) => {
                const eventListener = this.props[eventKey]
                const cancelEvent = this.shouldCancelTap && tapEventKeys.has(eventKey)

                if (eventListener && !cancelEvent) {
                    eventListener(framerEvent)
                }
            })
        }

        addEvent(eventName: HoverEventPropKey) {
            const framerEventListener = this.props[eventName]

            if (this.element && framerEventListener) {
                const eventHandler = (e: MouseEvent | TouchEvent) => {
                    const framerEvent = new FramerEvent(e)
                    framerEventListener(framerEvent)
                }

                this.activeEventListeners.set(eventName, eventHandler)
                const domEventName = hoverProps[eventName]
                this.element.addEventListener(domEventName, eventHandler)
            }
        }

        removeEvent(eventName: HoverEventPropKey) {
            const eventHandler = this.activeEventListeners.get(eventName)

            if (this.element && eventHandler) {
                const domEventName = hoverProps[eventName]
                this.element.removeEventListener(domEventName, eventHandler)
                this.activeEventListeners.delete(eventName)
            }
        }

        checkEvent(eventName: HoverEventPropKey, prevProps: ExtendedProps) {
            if (prevProps[eventName] !== this.props[eventName]) {
                this.removeEvent(eventName)
                this.addEvent(eventName)
            }
        }

        component: BaseComponentTypeRef = React.createRef()

        render() {
            return (
                <DraggingContext.Consumer>
                    {(value: { dragging: boolean }) => {
                        this.shouldCancelTap = value.dragging
                        return <BaseComponent {...this.props} ref={this.component} />
                    }}
                </DraggingContext.Consumer>
            )
        }
    }

    hoistNonReactStatic(withEvents, BaseComponent)
    return withEvents
}
