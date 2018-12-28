import { Rect } from "../types/Rect"
import { RenderTarget, RenderEnvironment } from "../types/RenderEnvironment"
import { BackgroundImage, ImageFit } from "../types/BackgroundImage"

/**
 * @internal
 */
export interface QualityOptions {
    frame: Rect
    target: RenderTarget
    zoom: number
}

export function imageUrlForAsset(asset: string) {
    const { imageBaseURL } = RenderEnvironment
    return resolveImagePath(_imageURL(asset, null, null, null, ""), imageBaseURL, RenderTarget.current())
}

export function imageUrlForFill(image: BackgroundImage, quality: QualityOptions | null = null) {
    const { src, intrinsicWidth, intrinsicHeight } = image
    const { imageBaseURL } = RenderEnvironment

    return resolveImagePath(
        _imageURL(src, intrinsicWidth || null, intrinsicHeight || null, quality, ""),
        imageBaseURL,
        quality ? quality.target : RenderTarget.canvas
    )
}

export function setImageForFill(image: BackgroundImage, quality: QualityOptions | null, style: React.CSSProperties) {
    const { src, pixelWidth, pixelHeight, intrinsicWidth, intrinsicHeight } = image
    const { imageBaseURL } = RenderEnvironment

    const backgroundImageURL = resolveImagePath(
        _imageURL(src, intrinsicWidth || null, intrinsicHeight || null, quality, ""),
        imageBaseURL,
        quality ? quality.target : RenderTarget.canvas
    )

    style.backgroundImage = `url("${backgroundImageURL}")`
    style.backgroundSize = cssBackgroundSize(image.fit)
    style.backgroundRepeat = "no-repeat"
    style.backgroundPosition = "center"
    style.imageRendering = _imageScalingMethod(
        src,
        quality,
        intrinsicWidth || null,
        intrinsicHeight || null,
        pixelWidth || null,
        pixelHeight || null,
        image.fit
    )
}

function cssBackgroundSize(size: ImageFit | undefined) {
    switch (size) {
        case "fit":
            return "contain"
        case "stretch":
            return "100% 100%"
        case "fill":
        default:
            return "cover"
    }
}

export function _imageURL(
    asset: string | null,
    intrinsicWidth: number | null,
    intrinsicHeight: number | null,
    quality: QualityOptions | null,
    imageBaseURL: string
): string {
    if (asset === null) return ""

    if (!quality || quality.target === RenderTarget.export || quality.target === RenderTarget.preview) {
        return imageURLForSize(asset, imageBaseURL, null)
    }

    const dpr = window.devicePixelRatio || 1

    // This uses different images at different zoom levels.
    // This will often switch images at zoom, but dragging large images around, especially when reparenting
    // is otherwise very costly. The images will be cached, switching isn't that expensive.
    const minimalWidthHeight = Math.max(quality.frame.width, quality.frame.height) * quality.zoom * dpr
    const intrinsicMinimalWidthHeight = Math.max(intrinsicHeight || 0, intrinsicWidth || 0)

    let size: number | null = null

    if (minimalWidthHeight <= 512 && intrinsicMinimalWidthHeight > 512) {
        size = 512
    } else if (minimalWidthHeight <= 1024 && intrinsicMinimalWidthHeight > 1024) {
        size = 1024
    } else if (minimalWidthHeight <= 2048 && intrinsicMinimalWidthHeight > 2048) {
        size = 2048
    }

    return imageURLForSize(asset, imageBaseURL, size)
}

// Use ‘auto’ when downscaling, ‘pixelated’ when upscaling
export function _imageScalingMethod(
    imageName: string | null,
    quality: QualityOptions | null,
    intrinsicWidth: number | null,
    intrinsicHeight: number | null,
    pixelWidth: number | null,
    pixelHeight: number | null,
    size: ImageFit = "fill"
) {
    if (imageName === null) return "auto"
    if (!quality) return "auto"

    const { frame, zoom, target } = quality
    let frameWidth = frame.width
    let frameHeight = frame.height

    if (zoom > 1) {
        frameWidth *= zoom
        frameHeight *= zoom
    }

    if (target !== RenderTarget.export && target !== RenderTarget.preview && window.devicePixelRatio) {
        frameWidth *= window.devicePixelRatio
        frameHeight *= window.devicePixelRatio
    }

    const imageWidth = pixelWidth || intrinsicWidth || 0
    const imageHeight = pixelHeight || intrinsicHeight || 0

    if (size === "fill") {
        // in this case the image will be enlarged if either the width or height is larger, and pixels are cut off
        if (frameWidth > imageWidth || frameHeight > imageHeight) return "pixelated"
    } else {
        // in these cases the images will be enlarged only if both width and height are larger
        if (frameWidth > imageWidth && frameHeight > imageHeight) return "pixelated"
    }
    return "auto"
}

function imageURLForSize(imageName: string | null, imageBaseURL: string, size: number | null): string {
    if (imageName === null) return ""
    const slash = imageBaseURL.length === 0 || imageBaseURL.endsWith("/") ? "" : "/"
    const cacheDir = size === null ? "" : `../../.cache/images/${size}/`
    return imageBaseURL + slash + cacheDir + imageName
}

function resolveImagePath(relativePath: string, imageBaseURL: string, target: RenderTarget): string {
    // absolute paths
    if (
        relativePath.startsWith("http://") ||
        relativePath.startsWith("https://") ||
        relativePath.startsWith("file://")
    ) {
        return relativePath
    }
    // for images from design components, their path will start with node_modules/PACKAGE_NAME/
    if (relativePath.startsWith("node_modules/")) {
        relativePath = "../../" + relativePath
    }
    if (target === RenderTarget.export) {
        return `##base64-${imageBaseURL}${relativePath}##`
    } else if (target === RenderTarget.preview) {
        return `${imageBaseURL.replace(/\/$/, "")}/design/images/${relativePath}`
    } // else
    return `${imageBaseURL.replace(/\/$/, "")}/${relativePath}`
}
