import { Interpolation } from "./Interpolation"

export const NoInterpolation: Interpolation<any> = {
    interpolate(from: any, to: any): ((progress: number) => any) {
        [from, to] = Interpolation.handleUndefined(from, to)
        return (progress: number): number => {
            return progress < 0.5 ? from : to
        }
    },
    difference(from: any, to: any): number {
        return from === to ? 0 : 1
    },
}
