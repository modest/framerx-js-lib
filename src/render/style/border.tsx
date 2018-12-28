import * as React from "react"
import { FrameProperties } from "../presentation/Frame"
import { Rect } from "../types/Rect"

export type BorderStyle = "solid" | "dashed" | "dotted" | "double"

export function collectBorderStyleForProps(props: FrameProperties, rect: Rect, style: React.CSSProperties) {
    const { borderWidth, borderStyle, borderColor } = props
    if (!borderWidth) {
        return
    }
    let borderTop: number
    let borderBottom: number
    let borderLeft: number
    let borderRight: number
    if (typeof borderWidth === "number") {
        borderTop = borderBottom = borderLeft = borderRight = borderWidth
    } else {
        borderTop = borderWidth.top || 0
        borderBottom = borderWidth.bottom || 0
        borderLeft = borderWidth.left || 0
        borderRight = borderWidth.right || 0
    }
    if (borderTop === 0 && borderBottom === 0 && borderLeft === 0 && borderRight === 0) {
        return
    }

    // Constraint border
    if (borderTop + borderBottom > rect.height) {
        const topRatio = borderTop / (borderTop + borderBottom)
        borderTop = Math.round(topRatio * rect.height)
        borderBottom = rect.height - borderTop
    }
    if (borderLeft + borderRight > rect.width) {
        const leftRatio = borderLeft / (borderLeft + borderRight)
        borderLeft = Math.round(leftRatio * rect.width)
        borderRight = rect.width - borderLeft
    }

    // Equal border
    if (borderTop === borderBottom && borderTop === borderLeft && borderTop === borderRight) {
        style.border = `${borderTop}px ${borderStyle} ${borderColor}`
        return
    }

    style.borderStyle = props.borderStyle
    style.borderColor = props.borderColor
    style.borderTopWidth = `${borderTop}px`
    style.borderBottomWidth = `${borderBottom}px`
    style.borderLeftWidth = `${borderLeft}px`
    style.borderRightWidth = `${borderRight}px`
}

export function borderForProps(
    props: FrameProperties,
    rect: Rect,
    borderRadius: number | string | undefined
): JSX.Element | null {
    if (!props.borderWidth) {
        return null
    }
    const style: React.CSSProperties = {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: borderRadius,
        pointerEvents: "none",
    }

    collectBorderStyleForProps(props, rect, style)

    return <div style={style} />
}
