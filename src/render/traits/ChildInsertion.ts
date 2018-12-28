import { Rect, Point, Size, Line } from "../../render"

export interface WithChildInsertion<P = {}> {
    childInsertion: (
        childRects: Rect[],
        containerSize: Size,
        insertion: Point,
        insertionMaxSize: Size,
        properties: P
    ) => { index: number; line: Line }
}

const key: keyof WithChildInsertion = "childInsertion"

export function withChildInsertion(target: any): target is WithChildInsertion {
    return key in target
}
