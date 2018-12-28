import { Animatable, isAnimatable } from "../animation/Animatable"

export function getObservableNumber(
    value: number | Animatable<number> | null | undefined,
    defaultValue: number = 0
): number {
    if (!value) {
        return defaultValue
    }
    if (isAnimatable(value)) {
        return value.get()
    }
    return value as number
}
