import { hash as stringHash } from "../../utils/string"
import { ConvertColor } from "./Color/ConvertColor"

/**
 * @public
 */
export interface LinearGradient {
    alpha: number
    angle: number
    start: string
    end: string
}

const gradientKeys: (keyof LinearGradient)[] = ["alpha", "angle", "start", "end"]

/**
 * @public
 */
export namespace LinearGradient {
    /**
     * @param linearGradient
     */
    export function isLinearGradient(linearGradient: any): linearGradient is LinearGradient {
        return linearGradient && gradientKeys.every(key => key in linearGradient)
    }

    /** @internal */
    export function hash(linearGradient: LinearGradient): number {
        return (
            linearGradient.alpha ^
            linearGradient.angle ^
            stringHash(linearGradient.start) ^
            stringHash(linearGradient.end)
        )
    }

    /** @alpha */
    export function toCSS(linearGradient: LinearGradient, overrideAngle?: number) {
        let { angle, start, end } = linearGradient
        const { alpha } = linearGradient
        if (alpha < 1) {
            start = ConvertColor.multiplyAlpha(start, alpha)
            end = ConvertColor.multiplyAlpha(end, alpha)
        }
        if (overrideAngle !== undefined) {
            angle = overrideAngle
        }
        return `linear-gradient(${angle}deg, ${start}, ${end})`
    }
}
