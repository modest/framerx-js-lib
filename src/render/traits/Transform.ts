import { Animatable } from "../../animation/Animatable"
import { Rect } from "../types/Rect"
import { RenderTarget, RenderEnvironment } from "../types/RenderEnvironment"
const { getNumber } = Animatable

export interface TransformProperties {
    z: Animatable<number> | number
    rotation: Animatable<number> | number
    rotationX: Animatable<number> | number
    rotationY: Animatable<number> | number
    rotationZ: Animatable<number> | number
    scale: Animatable<number> | number
    scaleX: Animatable<number> | number
    scaleY: Animatable<number> | number
    scaleZ: Animatable<number> | number
    skew: Animatable<number> | number
    skewX: Animatable<number> | number
    skewY: Animatable<number> | number
    originX: Animatable<number> | number
    originY: Animatable<number> | number
    originZ: Animatable<number> | number
}

export const transformDefaults: TransformProperties = {
    z: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skew: 0,
    skewX: 0,
    skewY: 0,
    originX: 0.5,
    originY: 0.5,
    originZ: 0,
}

export function collectTransformFromProps(props: TransformProperties, rect: Rect, style: React.CSSProperties) {
    // 3d properties
    const z = getNumber(props.z)
    const scaleZ = getNumber(props.scaleZ)
    const originZ = getNumber(props.originZ)
    const rotationZ = getNumber(props.rotationZ)
    const rotationX = getNumber(props.rotationX)
    const rotationY = getNumber(props.rotationY)

    const scale = getNumber(props.scale)
    const scaleX = getNumber(props.scaleX)
    const scaleY = getNumber(props.scaleY)
    const skew = getNumber(props.skew)
    const skewX = getNumber(props.skewX)
    const skewY = getNumber(props.skewY)
    const rotation = getNumber(props.rotation)

    // while exporting, using 3d transforms reduces artefacts in filters
    const force3d = RenderEnvironment.target === RenderTarget.export

    if (force3d || z !== 0 || scaleZ !== 1 || originZ !== 0 || rotationZ !== 0 || rotationX !== 0 || rotationY !== 0) {
        style.transform = `
            translate3d(${rect.x}px, ${rect.y}px, ${z}px)
            scale3d(${scaleX * scale}, ${scaleY * scale}, ${scaleZ})
            skew(${skew}deg,${skew}deg)
            skewX(${skewX}deg)
            skewY(${skewY}deg)
            translateZ(${originZ}px)
            rotateX(${rotationX}deg)
            rotateY(${rotationY}deg)
            rotateZ(${(rotation + rotationZ).toFixed(4)}deg)
            translateZ(${-originZ}px)`
    } else {
        style.transform = `
            translate(${rect.x}px, ${rect.y}px)
            scale(${scaleX * scale}, ${scaleY * scale})
            skew(${skew}deg,${skew}deg)
            skewX(${skewX}deg)
            skewY(${skewY}deg)
            rotate(${rotation.toFixed(4)}deg)`
    }

    const transformOrigin = `${getNumber(props.originX) * 100}% ${getNumber(props.originY) * 100}%`
    style.transformOrigin = transformOrigin
    style.WebkitTransformOrigin = transformOrigin
}
