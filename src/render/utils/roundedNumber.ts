export function roundedNumber(value: number, decimals: number): number {
    const d = Math.round(Math.abs(decimals))
    const multiplier = Math.pow(10, d)
    return Math.round(value * multiplier) / multiplier
}

export function roundedNumberString(value: number, decimals: number): string {
    const result = value.toFixed(decimals)
    if (decimals === 0) {
        return result
    }
    return result.replace(/\.?0+$/, "")
}

export function roundWithOffset(value: number, offset: number): number {
    if (offset === 0) {
        return Math.round(value)
    }
    offset -= offset | 0 // Remove everything before the comma
    if (offset < 0) {
        offset = 1 - offset
    }
    return Math.round(value - offset) + offset
    // }
}
