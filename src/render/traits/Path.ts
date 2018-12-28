import { RenderTarget, roundedNumberString } from "../"
import { isFiniteNumber } from "../utils/isFiniteNumber"
import { List } from "immutable"
import { PathSegment } from "../types/PathSegment"

/**
 * @internal
 */
export interface WithPath {
    pathSegments: List<PathSegment>
    pathClosed: boolean
}

const key: keyof WithPath = "pathSegments"

export function withPath(target: any): target is WithPath {
    return key in target
}

/**
 * @internal
 */
export type WithPaths = WithPath[]

export const pathDefaults: WithPath = {
    pathSegments: List([]),
    pathClosed: false,
}

export function toSVGPath(
    withPaths: WithPaths | WithPath,
    translate: { x: number; y: number } = { x: 0, y: 0 },
    canvasMode: RenderTarget = RenderTarget.canvas
): string {
    let pathElements: (number | string)[] = []

    let paths: WithPaths = []

    if (Array.isArray(withPaths)) {
        paths = withPaths
    } else {
        paths = [withPaths]
    }

    paths.forEach((path, index) => {
        const { pathClosed } = path
        let { pathSegments } = path
        pathSegments = List(pathSegments) // Ensure it is a list to allow an Array being passed

        const segmentCount = pathSegments.count()
        if (segmentCount === 0) return ""

        for (let i = 0; i < segmentCount; i++) {
            const segment = pathSegments.get(i)
            let nextSegment: PathSegment | undefined
            let prevSegment: PathSegment | undefined

            const isFirstSegment = i === 0
            const isLastSegment = i === segmentCount - 1

            if (!isLastSegment) {
                nextSegment = pathSegments.get(i + 1)
            } else if (pathClosed) {
                nextSegment = pathSegments.first()
            }

            if (!isFirstSegment) {
                prevSegment = pathSegments.get(i - 1)
            } else if (pathClosed) {
                prevSegment = pathSegments.last()
            }

            if (i === 0) {
                pathElements.push("M")
            } else if (prevSegment && isStraightCurve(prevSegment, segment)) {
                pathElements.push("L")
            }

            pathElements.push(segment.x + translate.x, segment.y + translate.y)

            if (nextSegment && !isStraightCurve(segment, nextSegment)) {
                const handleOut = PathSegment.calculatedHandleOut(segment)
                const handleIn = PathSegment.calculatedHandleIn(nextSegment)
                pathElements.push(
                    "C",
                    handleOut.x + translate.x,
                    handleOut.y + translate.y,
                    handleIn.x + translate.x,
                    handleIn.y + translate.y
                )
            }

            if (isLastSegment && nextSegment) {
                if (isStraightCurve(segment, nextSegment)) {
                    pathElements.push("Z")
                } else {
                    pathElements.push(nextSegment.x + translate.x, nextSegment.y + translate.y, "Z")
                }
            }
        }
    })
    if (canvasMode === RenderTarget.export || canvasMode === RenderTarget.preview) {
        pathElements = pathElements.map(value => (isFiniteNumber(value) ? roundedNumberString(value, 3) : value))
    }
    return pathElements.join(" ")
}

export function isStraightCurve(fromSegment: PathSegment, toSegment: PathSegment): boolean {
    const fromStraight =
        fromSegment.handleMirroring === "straight" || (fromSegment.handleOutX === 0 && fromSegment.handleOutY === 0)
    const toStraight =
        toSegment.handleMirroring === "straight" || (toSegment.handleInX === 0 && toSegment.handleInY === 0)
    return fromStraight && toStraight
}
