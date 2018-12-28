import * as React from "react"
import { Frame, FrameProps } from "./Frame"

interface Props {
    x: number
    y: number
    width: number
    height: number
    effect: Partial<FrameProps> | undefined
}

export class PageContainer extends React.Component<Props> {
    render() {
        const { x, y, width, height, effect } = this.props
        return (
            <Frame left={x} top={y} width={width} height={height} background={"transparent"} preserve3d={true}>
                <Frame width={"100%"} height={"100%"} preserve3d={false} {...effect} background={"transparent"}>
                    {this.props.children}
                </Frame>
            </Frame>
        )
    }
}
