import { Animatable, isAnimatable } from "../../animation/Animatable"
import { isFiniteNumber } from "../"

export type RadiusValue = number | Animatable<number> | string

export interface RadiusProperties {
    radius:
        | RadiusValue
        | Partial<{
              topLeft: RadiusValue
              topRight: RadiusValue
              bottomLeft: RadiusValue
              bottomRight: RadiusValue
          }>
}

const key: keyof RadiusProperties = "radius"

function hasRadius(props: any): props is any & RadiusProperties {
    return key in props
}

function getRadiusValue(value: any) {
    if (typeof value === "string") {
        return value || 0
    } else if (isAnimatable(value) || isFiniteNumber(value)) {
        return Animatable.getNumber(value)
    }
    return 0
}

export function collectRadiusFromProps(props: Partial<RadiusProperties>, style: React.CSSProperties) {
    if (!hasRadius(props)) return
    const { radius } = props
    if (typeof radius === "string" || isAnimatable(radius) || isFiniteNumber(radius)) {
        const radiusValue = getRadiusValue(radius)
        if (radiusValue) style.borderRadius = radiusValue
    } else if (radius) {
        const topLeft = getRadiusValue(radius.topLeft)
        const topRight = getRadiusValue(radius.topRight)
        const bottomRight = getRadiusValue(radius.bottomRight)
        const bottomLeft = getRadiusValue(radius.bottomLeft)
        if (topLeft || topRight || bottomRight || bottomLeft) {
            style.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`
        }
    }
}
