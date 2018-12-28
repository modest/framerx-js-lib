// Direct port of the old Framer equivalent:
// https://github.com/koenbok/Framer/blob/master/framer/Utils.coffee#L225

export function inspectObjectType(item: any) {
    // This is a hacky way to get nice object names, it tries to
    // parse them from the .toString methods for objects.

    let className
    if (
        (item.constructor !== null ? item.constructor.name : undefined) !== null &&
        (item.constructor !== null ? item.constructor.name : undefined) !== "Object"
    ) {
        return item.constructor.name
    }

    const extract = function(str: string) {
        if (!str) {
            return null
        }
        const regex = /\[object (\w+)\]/
        const match = regex.exec(str)
        if (match) {
            return match[1]
        }
        return null
    }

    if (item.toString) {
        className = extract(item.toString())
        if (className) {
            return className
        }
    }

    if (item.constructor !== null ? item.constructor.toString : undefined) {
        className = extract(item.constructor !== null ? item.constructor.toString() : undefined)
        if (className) {
            return className.replace("Constructor", "")
        }
    }

    return "Object"
}
