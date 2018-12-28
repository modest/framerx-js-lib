import { Record } from "immutable"

/**
 * @internal
 */
export const PathSegmentRecord = Record({
    x: 0,
    y: 0,
    handleMirroring: "straight",
    handleOutX: 0,
    handleOutY: 0,
    handleInX: 0,
    handleInY: 0,
    radius: 0,
})
