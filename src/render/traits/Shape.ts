import { WithPaths } from "./Path"

export interface WithShape {
    calculatedPaths(): WithPaths
}

const key: keyof WithShape = "calculatedPaths"

export function withShape(target: any): target is WithShape {
    return key in target
}
