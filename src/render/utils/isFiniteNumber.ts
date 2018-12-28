export function isFiniteNumber(value: any): value is number {
    return typeof value === "number" && isFinite(value)
}

export function finiteNumber(value: any): number | undefined {
    return isFiniteNumber(value) ? value : undefined
}
