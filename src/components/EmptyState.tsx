import * as React from "react"
import { RenderEnvironment, RenderTarget } from "../render/types/RenderEnvironment"
import { Frame, FrameProps } from "./Frame"
import { Size } from "../render/types/Size"
import { Color } from "../render"

export interface Props {
    // tslint:disable:react-unused-props-and-state
    children: React.ReactNode
    size: Size
    title?: string
    hide?: boolean
    showArrow?: boolean
    styleOverrides?: Partial<FrameProps>
}

export function EmptyState({
    title = "Connect to content",
    children,
    size,
    hide,
    showArrow = true,
    styleOverrides,
}: Props) {
    const { zoom, target } = RenderEnvironment
    if (target !== RenderTarget.canvas) return null
    if (hide) return null
    const childCount = React.Children.count(children)
    if (childCount !== 0) return null

    const width = size.width
    const height = size.height

    if (width < 0 || height < 0) return null

    // Determine when the frame is too small to show the text/arrow
    const minHeight = 24
    const arrowWidth = 28 / zoom
    const hasAvailableHeight = height >= minHeight / zoom

    const shouldShowArrow = showArrow && hasAvailableHeight && width >= arrowWidth + 6 / zoom
    const shouldShowTitle = hasAvailableHeight && (!showArrow || shouldShowArrow)

    const color = styleOverrides && styleOverrides.color ? styleOverrides.color : "#85F"
    const colorValue = Color.isColorObject(color) ? color.initialValue || Color.toRgbString(color) : color

    return (
        <Frame
            key={`empty-state`}
            top={0}
            left={0}
            width={width}
            height={height}
            background={"rgba(136, 85, 255, 0.2)"}
            color={color}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: `${minHeight}px`,
                padding: "0 10px",
            }}
            {...styleOverrides}
        >
            {shouldShowTitle && <Title zoom={zoom}>{title}</Title>}
            {shouldShowArrow && <Arrow color={colorValue} zoom={zoom} />}
        </Frame>
    )
}

function wantedScale(zoom: number) {
    // Scaling behavior when zoomed in should be similar to Vekter's ScreenTitle
    return Math.ceil(0.9 * Math.pow(11, Math.pow(zoom, 0.2))) / (11 * zoom)
}

const Title: React.SFC<{ zoom: number }> = ({ zoom, children }) => {
    return (
        <span
            style={{
                flex: "auto",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textAlign: "center",
                fontSize: 12 * wantedScale(zoom),
                // transform: `scale(${wantedScale(zoom)})`,
                // Use a mask to fade out the right edge of the text as it moves under the arrow.
                WebkitMaskImage: "linear-gradient(90deg, black, black calc(100% - 12px), transparent)",
            }}
        >
            {children}
        </span>
    )
}
const Arrow: React.SFC<{ color: string; zoom: number }> = ({ color, zoom }) => {
    const height = 7
    const width = 14
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{
                width: width,
                opacity: 0.9,
                transform: `scale(${wantedScale(zoom)})`,
                transformOrigin: "100% 50%",
                marginTop: 1,
            }}
        >
            <g transform="translate(0.5 0.5)">
                <path d="M 0 3 L 12 3" fill="transparent" stroke={color} strokeLinecap="butt" />
                <path d="M 9 0 L 12 3 L 9 6" fill="transparent" stroke={color} strokeLinecap="butt" />
            </g>
        </svg>
    )
}
