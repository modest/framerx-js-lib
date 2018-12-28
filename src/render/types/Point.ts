import { roundWithOffset } from "../utils/roundedNumber"

/**
 * @public
 */
interface Point {
    x: number
    y: number
}

/**
 * @public
 */
function Point(x: number, y: number): Point {
    return { x, y }
}

/**
 * @public
 */
namespace Point {
    /** @alpha */
    export const add = (...args: Point[]): Point => {
        return args.reduce(
            (previousValue, currentValue) => {
                return { x: previousValue.x + currentValue.x, y: previousValue.y + currentValue.y }
            },
            { x: 0, y: 0 }
        )
    }

    /** @alpha */
    export const subtract = (a: Point, b: Point): Point => {
        return { x: a.x - b.x, y: a.y - b.y }
    }

    /** @alpha */
    export const multiply = (a: Point, b: number): Point => {
        return { x: a.x * b, y: a.y * b }
    }

    /** @alpha */
    export const divide = (a: Point, b: number): Point => {
        return { x: a.x / b, y: a.y / b }
    }

    /** @alpha */
    export const absolute = (point: Point): Point => {
        return {
            x: Math.abs(point.x),
            y: Math.abs(point.y),
        }
    }

    /** @internal */
    export const reverse = (point: Point): Point => {
        return {
            x: point.x * -1,
            y: point.y * -1,
        }
    }

    /** @internal */
    export const pixelAligned = (point: Point, offset: Point = { x: 0, y: 0 }): Point => {
        return {
            x: roundWithOffset(point.x, offset.x),
            y: roundWithOffset(point.y, offset.y),
        }
    }

    /** @alpha */
    export const distance = (a: Point, b: Point): number => {
        const deltaX = Math.abs(a.x - b.x)
        const deltaY = Math.abs(a.y - b.y)
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }

    /** @alpha */
    export const angle = (a: Point, b: Point): number => {
        return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90
    }

    /** @public */
    export const isEqual = (a: Point, b: Point): boolean => {
        return a.x === b.x && a.y === b.y
    }

    /** @internal */
    export const rotationNormalizer = () => {
        let lastValue: number

        return (value: number) => {
            if (typeof lastValue !== "number") {
                lastValue = value
            }

            const diff = lastValue - value
            const maxDiff = Math.abs(diff) + 180
            const nTimes = Math.floor(maxDiff / 360)

            if (diff < 180) {
                value -= nTimes * 360
            }
            if (diff > 180) {
                value += nTimes * 360
            }

            lastValue = value
            return value
        }
    }

    /** @alpha */
    export function center(a: Point, b: Point) {
        return {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
        }
    }
}

export { Point }
