import { WithFractionOfFreeSpace } from "./FreeSpace"
import { Size } from "../types/Size"

export interface FreeSpaceProvider {
    freeSpace(size: Size, autoSize: Size, childFractions: Size, props: any): WithFractionOfFreeSpace
}

const freeSpaceProviderKey: keyof FreeSpaceProvider = "freeSpace"

export function providesFreeSpace(node: any): node is FreeSpaceProvider {
    return node && freeSpaceProviderKey in node && typeof node[freeSpaceProviderKey] === "function"
}

export function toFreeSpace(node: any, size: Size, autoSize: Size | null, childFractions: Size, props: any) {
    if (!providesFreeSpace(node) || !autoSize) return null
    return node.freeSpace(size, autoSize, childFractions, props)
}
