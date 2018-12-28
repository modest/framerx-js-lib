export function clamp(value: number, a: number, b: number): number {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    if (value < min) {
        value = min
    }
    if (value > max) {
        value = max
    }
    return value
}
// TODO: use another function from Library
export function modulate(value: number, rangeA: number[], rangeB: number[], limit = false): number {
    const [fromLow, fromHigh] = rangeA
    const [toLow, toHigh] = rangeB
    const result = toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow)
    if (limit === true) {
        if (toLow < toHigh) {
            if (result < toLow) {
                return toLow
            }
            if (result > toHigh) {
                return toHigh
            }
        } else {
            if (result > toLow) {
                return toLow
            }
            if (result < toHigh) {
                return toHigh
            }
        }
    }
    return result
}

export function isNumeric(value: number): boolean {
    return !isNaN(value) && isFinite(value)
}

export function percentToFraction(val: string): number {
    const digits = numberFromString(val)
    if (digits !== undefined) {
        if (~val.indexOf("%")) {
            return digits / 100
        }
        return digits
    }
    return 0
}
export function numberFromString(input: string): number | undefined {
    const match = input.match(/\d?\.?\d+/)
    return match ? Number(match[0]) : undefined
}
