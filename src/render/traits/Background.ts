import { Gradient, LinearGradient, RadialGradient } from "../types/Gradient"
import { Animatable } from "../../animation/Animatable"
import { Color } from "../types/Color"
import { BackgroundImage } from "../types/BackgroundImage"

export type Background = Color | Gradient | BackgroundImage | string

export interface BackgroundProperties {
    background: Animatable<Background> | Background | null
}

// Note: this does not include background images
export function collectBackgroundFromProps(props: Partial<BackgroundProperties>, style: React.CSSProperties) {
    const background = Animatable.get(props.background, null)
    if (typeof background === "string") {
        style.background = background
    } else if (LinearGradient.isLinearGradient(background)) {
        style.background = LinearGradient.toCSS(background)
    } else if (RadialGradient.isRadialGradient(background)) {
        style.background = RadialGradient.toCSS(background)
    } else if (Color.isColorObject(background)) {
        style.backgroundColor = background.initialValue || Color.toRgbString(background)
    }
}
