export { BackgroundImage }

export type ImageFit = "fill" | "fit" | "stretch"

interface BackgroundImage {
    src: string
    pixelWidth?: number
    pixelHeight?: number
    intrinsicWidth?: number
    intrinsicHeight?: number
    fit?: ImageFit
}

const key: keyof BackgroundImage = "src"

namespace BackgroundImage {
    export const isImageObject = function(image: any): image is object & BackgroundImage {
        if (!image || typeof image === "string") return false
        return key in image
    }
}
