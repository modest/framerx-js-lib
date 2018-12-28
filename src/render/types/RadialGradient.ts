import { ConvertColor } from "./Color"
import { memoize } from "../../utils/memoize"

const colorCache = new Map<[string, number], string>()
function cachedMultiplyAlpha(s: string, a: number): string {
    const key: [string, number] = [s, a]
    return memoize(1000, colorCache, key, () => ConvertColor.multiplyAlpha(s, a))
}

/**
 * @public
 */
export interface RadialGradient {
    alpha: number
    widthFactor: number
    heightFactor: number
    centerAnchorX: number
    centerAnchorY: number
    start: string
    end: string
}

const radialGradientKeys: (keyof RadialGradient)[] = [
    "alpha",
    "widthFactor",
    "heightFactor",
    "centerAnchorX",
    "centerAnchorY",
    "start",
    "end",
]

/**
 * @public
 */
export namespace RadialGradient {
    /**
     * @param radialGradient
     * @public
     */
    export function isRadialGradient(radialGradient: any): radialGradient is RadialGradient {
        return radialGradient && radialGradientKeys.every(key => key in radialGradient)
    }

    /** @alpha */
    export function toCSS(radialGradient: RadialGradient) {
        const { alpha, widthFactor, heightFactor, centerAnchorX, centerAnchorY } = radialGradient
        let { start, end } = radialGradient
        if (alpha < 1) {
            start = cachedMultiplyAlpha(start, alpha)
            end = cachedMultiplyAlpha(end, alpha)
        }
        return `radial-gradient(${widthFactor * 100}% ${heightFactor * 100}% at ${centerAnchorX *
            100}% ${centerAnchorY * 100}%, ${start}, ${end})`
    }
}
