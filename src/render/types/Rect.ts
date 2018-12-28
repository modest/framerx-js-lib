import { Point } from "./Point"
import { Size } from "./Size"
import { roundedNumber } from "../utils/roundedNumber"

/**
 * @public
 */
export interface Rect extends Point, Size {}

/**
 * @public
 */
export namespace Rect {
    /**
     *
     * @param rect
     * @param other
     * @public
     */
    export function equals(rect: Rect | null, other: Rect | null): boolean {
        if (rect === other) return true
        if (!rect || !other) return false
        return rect.x === other.x && rect.y === other.y && rect.width === other.width && rect.height === other.height
    }

    /** @alpha */
    export const atOrigin = (size: Size) => {
        return { ...size, x: 0, y: 0 }
    }

    /** @alpha */
    export const fromTwoPoints = (a: Point, b: Point): Rect => {
        return {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            width: Math.abs(a.x - b.x),
            height: Math.abs(a.y - b.y),
        }
    }

    /** @alpha */
    export const fromRect = (rect: ClientRect): Rect => {
        return {
            x: rect.left,
            y: rect.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
        }
    }

    /** @alpha */
    export const multiply = (rect: Rect, n: number): Rect => {
        return {
            x: rect.x * n,
            y: rect.y * n,
            width: rect.width * n,
            height: rect.height * n,
        }
    }

    /** @alpha */
    export const divide = (rect: Rect, n: number): Rect => {
        return multiply(rect, 1 / n)
    }

    /** @alpha */
    export const offset = (rect: Rect, delta: Partial<Point>): Rect => {
        const xOffset = typeof delta.x === "number" ? delta.x : 0
        const yOffset = typeof delta.y === "number" ? delta.y : 0
        return {
            ...rect,
            x: rect.x + xOffset,
            y: rect.y + yOffset,
        }
    }

    /** @alpha */
    export function inflate(rect: Rect, value: number) {
        if (value === 0) return rect
        const doubleValue = 2 * value
        return {
            x: rect.x - value,
            y: rect.y - value,
            width: rect.width + doubleValue,
            height: rect.height + doubleValue,
        }
    }

    /** @alpha */
    export const pixelAligned = (rect: Rect): Rect => {
        const x = Math.round(rect.x)
        const y = Math.round(rect.y)
        const rectMaxX = Math.round(rect.x + rect.width)
        const rectMaxY = Math.round(rect.y + rect.height)
        const width = Math.max(rectMaxX - x, 0)
        const height = Math.max(rectMaxY - y, 0)
        return { x, y, width, height }
    }

    /** @alpha */
    export const halfPixelAligned = (rect: Rect): Rect => {
        const x = Math.round(rect.x * 2) / 2
        const y = Math.round(rect.y * 2) / 2
        const rectMaxX = Math.round((rect.x + rect.width) * 2) / 2
        const rectMaxY = Math.round((rect.y + rect.height) * 2) / 2
        const width = Math.max(rectMaxX - x, 1)
        const height = Math.max(rectMaxY - y, 1)
        return { x, y, width, height }
    }

    /** @alpha */
    export const round = (rect: Rect, decimals = 0): Rect => {
        const x = roundedNumber(rect.x, decimals)
        const y = roundedNumber(rect.y, decimals)
        const width = roundedNumber(rect.width, decimals)
        const height = roundedNumber(rect.height, decimals)
        return { x, y, width, height }
    }

    /** @alpha */
    export const roundToOutside = (rect: Rect): Rect => {
        const x = Math.floor(rect.x)
        const y = Math.floor(rect.y)
        const rectMaxX = Math.ceil(rect.x + rect.width)
        const rectMaxY = Math.ceil(rect.y + rect.height)
        const width = Math.max(rectMaxX - x, 0)
        const height = Math.max(rectMaxY - y, 0)
        return { x, y, width, height }
    }

    /**
     * @param rect
     * @beta
     */
    export const minX = (rect: Rect) => {
        return rect.x
    }

    /**
     * @param rect
     * @beta
     */
    export const maxX = (rect: Rect) => {
        return rect.x + rect.width
    }

    /**
     * @param rect
     * @beta
     */
    export const minY = (rect: Rect) => {
        return rect.y
    }

    /**
     * @param rect
     * @beta
     */
    export const maxY = (rect: Rect) => {
        return rect.y + rect.height
    }

    /** @internal */
    export const positions = (rect: Rect) => {
        return {
            minX: rect.x,
            midX: rect.x + rect.width / 2,
            maxX: maxX(rect),
            minY: rect.y,
            midY: rect.y + rect.height / 2,
            maxY: maxY(rect),
        }
    }

    /**
     *
     * @param rect
     * @beta
     */
    export const center = (rect: Rect) => {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
        }
    }

    /** @internal */
    export const fromPoints = (ps: Point[]) => {
        const xValues = ps.map(point => point.x)
        const yValues = ps.map(point => point.y)
        const x = Math.min(...xValues)
        const y = Math.min(...yValues)
        const width = Math.max(...xValues) - x
        const height = Math.max(...yValues) - y
        return { x, y, width, height }
    }

    /**
     * Returns a rect containing all input rects
     * @param rect a list of rectangels
     * @returns A rectangle that fits exactly around the input rects
     * @internal
     */
    export const merge = (...rect: Rect[]): Rect => {
        const min = {
            x: Math.min(...rect.map(minX)),
            y: Math.min(...rect.map(minY)),
        }

        const max = {
            x: Math.max(...rect.map(maxX)),
            y: Math.max(...rect.map(maxY)),
        }

        return fromTwoPoints(min, max)
    }

    /** @alpha */
    export const intersection = (rect1: Rect, rect2: Rect): Rect => {
        const x = Math.max(rect1.x, rect2.x)
        const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width)
        const y = Math.max(rect1.y, rect2.y)
        const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height)
        return { x, y, width: x2 - x, height: y2 - y }
    }

    /**
     * Returns all the corner points for a rect
     * @param rect
     * @internal
     */
    export const points = (rect: Rect): Point[] => {
        return [
            { x: minX(rect), y: minY(rect) },
            { x: minX(rect), y: maxY(rect) },
            { x: maxX(rect), y: minY(rect) },
            { x: maxX(rect), y: maxY(rect) },
        ]
    }

    /**
     * Checks if a rectangle contains a point
     * @param rect The rectangle to check
     * @param point The point to check
     * @returns true if the provided rectangle contains the provided point
     * @beta
     */
    export const containsPoint = (rect: Rect, point: Point) => {
        if (point.x < minX(rect)) {
            return false
        }
        if (point.x > maxX(rect)) {
            return false
        }
        if (point.y < minY(rect)) {
            return false
        }
        if (point.y > maxY(rect)) {
            return false
        }
        if (isNaN(rect.x)) {
            return false
        }
        if (isNaN(rect.y)) {
            return false
        }
        return true
    }

    /**
     * Returns wether a rect contains another rect entirely
     * @param rectA
     * @param rectB
     * @returns true if rectA contains rectB
     */
    export const containsRect = (rectA: Rect, rectB: Rect) => {
        for (const point of points(rectB)) {
            if (!containsPoint(rectA, point)) {
                return false
            }
        }

        return true
    }

    /** @alpha */
    export const toCSS = (rect: Rect) => {
        return {
            display: "block",
            transform: `translate(${rect.x}px, ${rect.y}px)`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
        }
    }

    /** @alpha */
    export const inset = (rect: Rect, n: number) => {
        return {
            x: rect.x + n,
            y: rect.y + n,
            width: Math.max(0, rect.width - 2 * n),
            height: Math.max(0, rect.height - 2 * n),
        }
    }

    /** @alpha */
    export const intersects = (rectA: Rect, rectB: Rect): boolean => {
        return !(rectB.x >= maxX(rectA) || maxX(rectB) <= rectA.x || rectB.y >= maxY(rectA) || maxY(rectB) <= rectA.y)
    }

    /** @internal */
    export const overlapHorizontally = (rectA: Rect, rectB: Rect): boolean => {
        const aMax = Rect.maxX(rectA)
        const bMax = Rect.maxX(rectB)
        return aMax > rectB.x && bMax > rectA.x
    }

    /** @internal */
    export const overlapVertically = (rectA: Rect, rectB: Rect): boolean => {
        const aMax = Rect.maxY(rectA)
        const bMax = Rect.maxY(rectB)
        return aMax > rectB.y && bMax > rectA.y
    }

    /** @internal */
    export const doesNotIntersect = (rect: Rect, rects: Rect[]): boolean => {
        return (
            rects.find(comparingRect => {
                return Rect.intersects(comparingRect, rect)
            }) === undefined
        )
    }

    /**
     *
     * @param rectA
     * @param rectB
     * @return if the input rectangles are equal in size and position
     * @public
     */
    export const isEqual = (rectA: Rect | null, rectB: Rect | null) => {
        if (rectA && rectB) {
            const { x, y, width, height } = rectA
            return rectB.x === x && rectB.y === y && rectB.width === width && rectB.height === height
        } else {
            return rectA === rectB
        }
    }

    /** @internal */
    export const cornerPoints = (rect: Rect): Point[] => {
        const rectMinX = rect.x
        const rectMaxX = rect.x + rect.width
        const rectMinY = rect.y
        const rectMaxY = rect.y + rect.height
        const corner1 = { x: rectMinX, y: rectMinY }
        const corner2 = { x: rectMaxX, y: rectMinY }
        const corner3 = { x: rectMaxX, y: rectMaxY }
        const corner4 = { x: rectMinX, y: rectMaxY }
        return [corner1, corner2, corner3, corner4]
    }

    /** @internal */
    export const midPoints = (rect: Rect): Point[] => {
        const rectMinX = rect.x
        const rectMidX = rect.x + rect.width / 2
        const rectMaxX = rect.x + rect.width
        const rectMinY = rect.y
        const rectMidY = rect.y + rect.height / 2
        const rectMaxY = rect.y + rect.height
        const corner1 = { x: rectMidX, y: rectMinY }
        const corner2 = { x: rectMaxX, y: rectMidY }
        const corner3 = { x: rectMidX, y: rectMaxY }
        const corner4 = { x: rectMinX, y: rectMidY }
        return [corner1, corner2, corner3, corner4]
    }

    /** @internal */
    export const pointDistance = (rect: Rect, point: Point) => {
        let x = 0
        let y = 0
        if (point.x < rect.x) {
            x = rect.x - point.x
        } else if (point.x > Rect.maxX(rect)) {
            x = point.x - Rect.maxX(rect)
        }
        if (point.y < rect.y) {
            y = rect.y - point.y
        } else if (point.y > Rect.maxY(rect)) {
            y = point.y - Rect.maxY(rect)
        }
        return Point.distance({ x, y }, { x: 0, y: 0 })
    }

    const fromAnyDefaults = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }

    /** @internal */
    export const fromAny = (rect: any, defaults = fromAnyDefaults): Rect => {
        return {
            x: rect.x || defaults.x,
            y: rect.y || defaults.y,
            width: rect.width || defaults.width,
            height: rect.height || defaults.height,
        }
    }
}
