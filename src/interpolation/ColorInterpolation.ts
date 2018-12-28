import { Interpolation } from "./Interpolation"
import { Color } from "../render/types/Color"
import { ColorMixModelType, IncomingColor } from "../render/types/Color/types"

export const ColorInterpolation: (type?: ColorMixModelType) => Interpolation<Color> = (
    type: ColorMixModelType = ColorMixModelType.HUSL
) => {
    return {
        interpolate(from: IncomingColor, to: IncomingColor): ((progress: number) => Color) {
            [from, to] = Interpolation.handleUndefined(from, to)
            return Color.interpolate(Color(from), Color(to), type)
        },
        difference(from: IncomingColor, to: IncomingColor): number {
            return Color.difference(Color(from), Color(to))
        },
    }
}
