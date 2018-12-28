import * as React from "react"
import { FramerEventSession } from "../events/FramerEventSession"
import { FrameProps, Frame } from "./Frame"
import { FramerEventListener, FramerEvent } from "../events"
import { WithEventsProperties } from "./hoc/WithEvents"

export interface ScreenProperties {
    width: number
    height: number
    scale?: number
    color?: string
}

export class Screen extends React.Component<ScreenProperties> {
    session = new FramerEventSession(this.dispatcher)
    private frameRef = React.createRef<React.Component<FrameProps & Partial<WithEventsProperties>>>()

    componentDidMount() {
        if (this.frameRef.current) {
            const withEvents = this.frameRef.current as any
            if (withEvents.component.current) {
                this.session.originElement = withEvents.component.current.element
            }
        }
    }

    render() {
        const frame = (
            <Frame
                ref={this.frameRef}
                originX={0}
                originY={0}
                width={this.props.width}
                height={this.props.height}
                scale={this.props.scale}
                background={this.props.color || "none"}
            >
                {this.props.children}
            </Frame>
        )

        return <FramerEventListener session={this.session}>{frame}</FramerEventListener>
    }

    private dispatcher(type: string, event: FramerEvent, target: EventTarget) {
        target.dispatchEvent(new CustomEvent("FramerEvent", { bubbles: true, detail: { type: type, event: event } }))
    }
}
