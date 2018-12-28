import { Size } from "../types/Size"

export interface PaddingSizeProvider {
    paddingSize(props: any): Size
}

const key: keyof PaddingSizeProvider = "paddingSize"

export function providesPaddingSize(node: any): node is PaddingSizeProvider {
    return node && key in node && typeof node[key] === "function"
}

export function toPaddingSize(node: any, props: any) {
    if (!providesPaddingSize(node)) return Size.zero
    return node.paddingSize(props)
}
