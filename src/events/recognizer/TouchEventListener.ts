import * as React from "react"
import { FramerEventSession } from "../FramerEventSession"
import { FramerEvent } from "../"

export interface Props {
    session: FramerEventSession
}

/**
 * @internal
 */
export class TouchEventListener extends React.Component<Props> {
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
        window.addEventListener("touchstart", this.domTouchStart)
    }

    /**
     * @internal
     */
    componentWillUnmount() {
        window.removeEventListener("touchstart", this.domTouchStart)
        window.removeEventListener("touchmove", this.domTouchMove)
        window.removeEventListener("touchend", this.domTouchEnd)
    }

    /**
     * @internal
     */
    domTouchStart = (originalEvent: TouchEvent) => {
        window.addEventListener("touchmove", this.domTouchMove)
        window.addEventListener("touchend", this.domTouchEnd)
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerDown(event)
    }

    /**
     * @internal
     */
    domTouchMove = (originalEvent: TouchEvent) => {
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerMove(event)
    }

    /**
     * @internal
     */
    domTouchEnd = (originalEvent: TouchEvent) => {
        window.removeEventListener("touchmove", this.domTouchMove)
        window.removeEventListener("touchend", this.domTouchEnd)
        const event = new FramerEvent(originalEvent, this.props.session)
        this.props.session.pointerUp(event)
    }
}
