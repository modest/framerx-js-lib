import { Size } from "../types/Size"
import { Rect } from "../types/Rect"

export interface ChildLayoutProvider {
    childLayoutRects: (childSizes: Size[], size: Size, props: any, invisibleItems: number[]) => Rect[]
}

const key: keyof ChildLayoutProvider = "childLayoutRects"

export function providesChildLayout(node: any): node is ChildLayoutProvider {
    return key in node
}
