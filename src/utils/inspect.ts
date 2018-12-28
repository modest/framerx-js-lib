// Direct port of the old Framer equivalent:
// https://github.com/koenbok/Framer/blob/master/framer/Utils.coffee#L249

import { inspectObjectType } from "./inspectObjectType"
import { isFunction, isString, isNumber, isArray, isObject } from "./utils"

export function inspect(item: any, max?: number, l?: number): string {
    if (max === undefined) {
        max = 5
    }
    if (l === undefined) {
        l = 0
    }
    if (item === null) {
        return "null"
    }
    if (item === undefined) {
        return "undefined"
    }

    if (isFunction(item.toInspect)) {
        return item.toInspect()
    }
    if (isString(item)) {
        return `\"${item}\"`
    }
    if (isNumber(item)) {
        return `${item}`
    }
    if (isFunction(item)) {
        let code = item
            .toString()
            .slice("function ".length)
            .replace(/\n/g, "")
            .replace(/\s+/g, " ")
        // We limit the size of a function body if it's in a strucutre
        const limit = 50
        if (code.length > limit && l > 0) {
            code = `${code.slice(0, +limit + 1 || undefined).trim()}… }`
        }
        return `<Function ${code}>`
    }
    if (isArray(item)) {
        if (l > max) {
            return "[...]"
        }
        return `[${item.map(i => inspect(i, max, (l || 0) + 1)).join(", ")}]`
    }
    if (isObject(item)) {
        let objectInfo
        const objectType = inspectObjectType(item)
        // We should not loop over dom trees because we will have a bad time
        if (/HTML\w+?Element/.test(objectType)) {
            return `<${objectType}>`
        }
        if (l > max) {
            objectInfo = "{...}"
        } else {
            const itemKeys = Object.keys(item)
            objectInfo = `{${itemKeys.map(k => `${k}:${inspect(item[k], max, (l || 0) + 1)}`).join(", ")}}`
        }
        if (objectType === "Object") {
            return objectInfo
        }
        return `<${objectType} ${objectInfo}>`
    }

    return `${item}`
}
