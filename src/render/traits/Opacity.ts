import { Animatable } from "../../animation/Animatable"

export interface WithOpacity {
    opacity: number | Animatable<number>
}

const key: keyof WithOpacity = "opacity"

export function withOpacity(target: any): target is WithOpacity {
    return key in target
}

export function collectOpacityFromProps(props: Partial<WithOpacity>, style: React.CSSProperties) {
    if (!withOpacity(props)) return
    const opacity = Animatable.getNumber(props.opacity)
    if (opacity === 1) return
    style.opacity = opacity
}
