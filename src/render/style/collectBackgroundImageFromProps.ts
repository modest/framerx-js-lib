import { BackgroundProperties } from "../traits/Background"
import { Animatable } from "../../animation/Animatable"
import { BackgroundImage } from "../types/BackgroundImage"
import { Rect } from "../types/Rect"
import { RenderEnvironment } from "../types/RenderEnvironment"
import { QualityOptions, setImageForFill } from "../utils/imageForFill"
import { LayerProps } from "../presentation/Layer"

export function collectBackgroundImageFromProps(
    props: Partial<BackgroundProperties & LayerProps>,
    rect: Rect,
    style: React.CSSProperties,
    shouldCheckImageAvailability: boolean,
    checkImageAvailability: (options: QualityOptions) => void
) {
    let background = Animatable.get(props.background, null)
    if (BackgroundImage.isImageObject(background)) {
        const { _forwardedOverrides, id } = props
        const src = _forwardedOverrides && id ? _forwardedOverrides[id] : undefined
        if (src) {
            background = { ...background, src }
        }
        const { target, zoom } = RenderEnvironment
        if (rect && target !== undefined && zoom) {
            // Don't load lower quality images when the image changed, because lower quality images are generated async
            const qualityOptions: QualityOptions = {
                frame: rect,
                target,
                zoom,
            }

            setImageForFill(background, qualityOptions, style)
            if (shouldCheckImageAvailability) {
                checkImageAvailability(qualityOptions)
            }
        }
    }
}
