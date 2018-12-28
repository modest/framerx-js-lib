import { PathSegmentRecord } from "./PathSegmentRecord"
import { Point } from "../"

/**
 * @internal
 */
export namespace PathSegment {
    export type HandleMirroring = "straight" | "symmetric" | "disconnected" | "asymmetric"
    // Note: more additions to this namespace below
}

/**
 * @internal
 */
export class PathSegment extends PathSegmentRecord {
    x: number // The anchor point of the segment.
    y: number
    handleMirroring: PathSegment.HandleMirroring
    handleOutX: number // Describes the out tangent of the segment.
    handleOutY: number
    handleInX: number // Describes the in tangent of the segment.
    handleInY: number
    radius: number

    toJS() {
        const JS = super.toJS()
        JS["__class"] = this.constructor.name
        return JS
    }

    toJSON() {
        return this.toJS()
    }
}

/**
 * @internal
 */
export namespace PathSegment {
    export const point = (pathSegment: PathSegment) => {
        return { x: pathSegment.x, y: pathSegment.y }
    }

    export const handleOut = (pathSegment: PathSegment) => {
        return { x: pathSegment.handleOutX, y: pathSegment.handleOutY }
    }

    export const handleIn = (pathSegment: PathSegment) => {
        return { x: pathSegment.handleInX, y: pathSegment.handleInY }
    }

    export const calculatedHandleOut = (pathSegment: PathSegment): Point => {
        switch (pathSegment.handleMirroring) {
            case "symmetric":
            case "disconnected":
            case "asymmetric":
                return Point.add(point(pathSegment), handleOut(pathSegment))
            default:
                return { x: pathSegment.x, y: pathSegment.y }
        }
    }

    export const calculatedHandleIn = (pathSegment: PathSegment): Point => {
        switch (pathSegment.handleMirroring) {
            case "symmetric":
                return Point.subtract(point(pathSegment), handleOut(pathSegment))
            case "disconnected":
            case "asymmetric":
                return Point.add(point(pathSegment), handleIn(pathSegment))
            default:
                return point(pathSegment)
        }
    }

    export const curveDefault = (points: PathSegment[], index: number): Point => {
        if (points.length > 2) {
            let pointBefore: PathSegment
            let pointAfter: PathSegment

            if (index === 0) {
                pointBefore = points[points.length - 1]
            } else {
                pointBefore = points[index - 1]
            }

            if (index === points.length - 1) {
                pointAfter = points[0]
            } else {
                pointAfter = points[index + 1]
            }

            const delta = Point.subtract(point(pointAfter), point(pointBefore))
            return { x: delta.x / 4, y: delta.y / 4 }
        }

        return { x: 10, y: 10 }
    }
}
