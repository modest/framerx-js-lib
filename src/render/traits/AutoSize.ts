import { Size } from "../types/Size"

export interface AutoSize {
    autoSize(minChildrenSizes: Size[], props: any, invisibleItems: number[]): Size
}

const key: keyof AutoSize = "autoSize"

export function hasAutoSize(node: any): node is AutoSize {
    return node && key in node && typeof node[key] === "function"
}

export function toAutoSize(node: any, minChildrenSizes: Size[], props: any, invisibleItems: number[]) {
    if (!hasAutoSize(node)) return null
    return node.autoSize(minChildrenSizes, props, invisibleItems)
}
