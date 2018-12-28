export const delay = (time = 0, f: Function) => {
    setTimeout(f, time * 1000)
}

// Shallow type checkers used by "inspect". Can be made
// more terse:

export function isFunction(value: any): value is Function {
    return value instanceof Function
}

export function isString(value: any): value is string {
    return typeof value === "string"
}

export function isNumber(value: any): value is number {
    return typeof value === "number"
}

export function isArray<T>(value: any): value is Array<T> {
    return value instanceof Array
}

export function isObject(value: any): value is Object {
    return typeof value === "object"
}
