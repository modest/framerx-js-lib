import * as React from "react"
import { imageUrlForAsset } from "../utils/imageForFill"

export interface ImagePatternElementProperties {
    id: string
    path: string
    transform?: string
}

export class ImagePatternElement extends React.Component<ImagePatternElementProperties, {}> {
    render() {
        const { id, path, transform } = this.props
        const xlinkHref = imageUrlForAsset(path)

        return (
            <pattern id={id} width={"100%"} height={"100%"} patternContentUnits="objectBoundingBox">
                <image
                    key={xlinkHref} // To make sure the xlinkHref gets updated correctly, else React updates href
                    width={1}
                    height={1}
                    xlinkHref={xlinkHref}
                    preserveAspectRatio="none"
                    transform={transform}
                />
            </pattern>
        )
    }
}
