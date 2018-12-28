import { LinearGradient } from "../types/Gradient"
import { ConvertColor } from "../types/Color"

export interface LinearGradientElementProperties {
    id: string
    angle: number
    startColor: string
    startAlpha: number
    stopColor: string
    stopAlpha: number
}

export function elementPropertiesForLinearGradient(
    gradient: LinearGradient,
    id: string
): LinearGradientElementProperties {
    const gradientId = `id${id}g${LinearGradient.hash(gradient)}`
    const startAlpha = ConvertColor.getAlpha(gradient.start) * gradient.alpha
    const endAlpha = ConvertColor.getAlpha(gradient.end) * gradient.alpha

    return {
        id: gradientId,
        angle: gradient.angle - 90,
        startColor: gradient.start,
        startAlpha: startAlpha,
        stopColor: gradient.end,
        stopAlpha: endAlpha,
    }
}
