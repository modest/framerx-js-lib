import { Rect } from "../../render"

export type RectProvider<T> = (props: T) => Rect
export interface RectProviding<Props> extends React.ComponentClass<Props> {
    rect: RectProvider<Props>
}

export function isRectProviding<T, C extends React.ComponentType<T>>(c: C | RectProviding<T>): c is RectProviding<T> {
    return "rect" in c && c.rect instanceof Function
}

export function rectFromReactNode(node: React.ReactNode): Rect | null {
    if (!node || node === true || typeof node === "number" || typeof node === "string" || typeof node["type"] === "string") {
        return null
    }
    const type = node["type"]
    const props = node["props"]
    if (type && props && isRectProviding(type)) {
        return type.rect(props)
    } else {
        return null
    }
}
