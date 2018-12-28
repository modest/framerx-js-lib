import { Interpolation } from "./Interpolation"

export const NumberInterpolation: Interpolation<number> = {
    interpolate(from: number, to: number): ((progress: number) => number) {
        [from, to] = Interpolation.handleUndefined(from, to)
        const a1 = +from
        const b1 = to - a1
        return (progress: number): number => {
            const value = a1 + b1 * progress
            return value
        }
    },
    difference(from: number, to: number): number {
        return to - from
    },
}
