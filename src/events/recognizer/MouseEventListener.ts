import * as React from "react"
import { FramerEventSession } from "../FramerEventSession"
import { FramerEvent } from "../FramerEvent"

export interface MouseProps {
    session: FramerEventSession
}
/**
 * @internal
 */
export class MouseEventListener extends React.Component<MouseProps> {
    /**
     * @internal
     */
    render() {
        return this.props.children
    }

    /**
     * @internal
     */
    componentDidMount() {
        window.addEventListener("mousedown", this.domMouseDown)
        window.addEventListener("mousewheel", this.domMouseWheel)
    }

    /**
     * @internal
     */
    componentWillUnmount() {
        window.removeEventListener("mousemove", this.domMouseMove)
        window.removeEventListener("mousedown", this.domMouseDown)
        window.removeEventListener("mouseup", this.domMouseUp)
        window.removeEventListener("mousewheel", this.domMouseWheel)
    }

    /**
     * @internal
     */
    domMouseDown = (originalEvent: MouseEvent) => {
        window.addEventListener("mousemove", this.domMouseMove)
        window.addEventListener("mouseup", this.domMouseUp)
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerDown(event)
    }

    /**
     * @internal
     */
    domMouseMove = (originalEvent: MouseEvent) => {
        const leftMouseButtonOnlyDown =
            originalEvent.buttons === undefined ? originalEvent.which === 1 : originalEvent.buttons === 1

        // mousemoves should only be registred when left mouse button is down
        if (!leftMouseButtonOnlyDown) {
            this.domMouseUp(originalEvent)
            return
        }

        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerMove(event)
    }

    /**
     * @internal
     */
    domMouseUp = (originalEvent: MouseEvent) => {
        window.removeEventListener("mousemove", this.domMouseMove)
        window.removeEventListener("mouseup", this.domMouseUp)
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerUp(event)
    }

    /**
     * @internal
     */
    domMouseWheel = (originalEvent: MouseEvent) => {
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.mouseWheel(event)
    }
}
