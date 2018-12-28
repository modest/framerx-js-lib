import * as React from "react"
import { Layer, LayerProps } from "./Layer"
import { ConstraintProperties, ConstraintValues, UserConstraintValues } from "../types/Constraints"
import { Rect } from "../types/Rect"
import { ConvertColor, Color } from "../types/Color"
import { LinearGradient } from "../types/LinearGradient"
import { collectOpacityFromProps } from "../traits/Opacity"
import { collectFiltersFromProps } from "../utils/filtersForNode"
import { RenderEnvironment } from "../types/RenderEnvironment"
import { Shadow } from "../types/Shadow"
import { Animatable, AnimatableObject } from "../../animation/Animatable"
import {
    BackgroundImage,
    imagePatternPropsForFill,
    Background,
    isFiniteNumber,
    FilterProperties,
    BackgroundFilterProperties,
    RadiusProperties,
    WithOpacity,
    Size,
    WithFractionOfFreeSpace,
} from "../"
import { ImagePatternElement } from "./ImagePatternElement"

/**
 * @internal
 */
export interface SVGProps
    extends ConstraintProperties,
        Partial<FilterProperties & BackgroundFilterProperties & RadiusProperties & WithOpacity> {
    rotation: Animatable<number> | number
    visible: boolean
    name?: string
    fill?: Animatable<Background> | Background | null
    svg: string
    intrinsicWidth?: number
    intrinsicHeight?: number
    shadows: Shadow[]
}

/**
 * @internal
 */
export interface SVGProperties extends SVGProps, LayerProps {}

/**
 * @internal
 */
export class SVG extends Layer<SVGProperties, {}> {
    static supportsConstraints = true
    static defaultSVGProps: SVGProps = {
        left: null,
        right: null,
        top: null,
        bottom: null,
        centerX: "50%",
        centerY: "50%",
        aspectRatio: null,
        parentSize: null,
        width: 100,
        height: 100,
        rotation: 0,
        visible: true,
        svg: "",
        shadows: [],
    }

    static readonly defaultProps: SVGProperties = {
        ...Layer.defaultProps,
        ...SVG.defaultSVGProps,
    }

    static frame(props: Partial<ConstraintProperties>) {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toRect(constraintValues, props.parentSize || null)
    }

    get frame(): Rect {
        return ConstraintValues.toRect(this.constraintValues(), this.props.parentSize || null)
    }

    static minSize(
        props: Partial<ConstraintProperties>,
        parentSize: Size | AnimatableObject<Size> | null | undefined
    ): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toMinSize(constraintValues, parentSize || null)
    }

    static size(
        props: Partial<ConstraintProperties>,
        parentSize: Size | AnimatableObject<Size> | null | undefined,
        freeSpace: WithFractionOfFreeSpace
    ): Size {
        const constraintValues = ConstraintValues.fromProperties(props)
        return ConstraintValues.toSize(constraintValues, parentSize || null, null, freeSpace)
    }

    private _constraintCache: UserConstraintValues | null
    constraintValues(): UserConstraintValues {
        // TODO add proper caching and cache invalidation
        // const _constraints = this._constraintCache
        // if (_constraints) return _constraints

        return (this._constraintCache = ConstraintValues.fromProperties(this.props))
    }

    componentDidUpdate(prevProps: SVGProperties) {
        super.componentDidUpdate(prevProps)

        const { fill } = this.props
        if (
            BackgroundImage.isImageObject(fill) &&
            BackgroundImage.isImageObject(prevProps.fill) &&
            fill.src !== prevProps.fill.src
        ) {
            this.resetSetStyle("fill", null, false)
        }
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()

        const {
            id,
            visible,
            fill,
            rotation,
            svg,
            intrinsicHeight,
            intrinsicWidth,
            willChangeTransform,
        } = this.properties
        if (!visible || !id) {
            return null
        }

        const frame = this.frame

        const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${frame.x}px, ${frame.y}px) rotate(${Animatable.getNumber(rotation).toFixed(4)}deg)`,
            width: `${frame.width}px`,
            height: `${frame.height}px`,
            imageRendering: "pixelated",
            opacity: isFiniteNumber(this.properties.opacity) ? this.properties.opacity : 1,
        }

        collectOpacityFromProps(this.props, style)
        collectFiltersFromProps(this.props, style)

        if (willChangeTransform) {
            style.willChange = "transform"
        }

        const xFactor = frame.width / (intrinsicWidth || 1)
        const yFactor = frame.height / (intrinsicHeight || 1)

        // if we zoom differently again in export, we might need this again: canvasMode !== CanvasModeExport
        const { zoom } = RenderEnvironment
        const zoomFactor = zoom > 1 ? zoom : 1
        const innerStyle: React.CSSProperties = {
            transform: `scale(${xFactor * zoomFactor}, ${yFactor * zoomFactor})`,
            transformOrigin: "top left",
            zoom: 1 / zoomFactor,
        }

        if (intrinsicWidth && intrinsicHeight) {
            innerStyle.width = intrinsicWidth
            innerStyle.height = intrinsicHeight
        }

        let fillElement: JSX.Element | null = null
        if (typeof fill === "string" || Color.isColorObject(fill)) {
            const fillColor = Color.isColorObject(fill) ? fill.initialValue || Color.toRgbString(fill) : fill
            style.fill = fillColor
            style.color = fillColor
        } else if (LinearGradient.isLinearGradient(fill)) {
            const gradient = fill
            // We need encodeURI() here to handle our old id's that contained special characters like ';'
            // Creating an url() entry for those id's unescapes them, so we need to use the URI encoded version
            const gradientId = `${encodeURI(id || "")}g${LinearGradient.hash(gradient)}`
            style.fill = `url(#${gradientId})`
            const startAlpha = ConvertColor.getAlpha(gradient.start) * gradient.alpha
            const endAlpha = ConvertColor.getAlpha(gradient.end) * gradient.alpha
            fillElement = (
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ position: "absolute" }}>
                    <linearGradient id={gradientId} gradientTransform={`rotate(${gradient.angle - 90}, 0.5, 0.5)`}>
                        <stop offset="0" stopColor={gradient.start} stopOpacity={startAlpha} />
                        <stop offset="1" stopColor={gradient.end} stopOpacity={endAlpha} />
                    </linearGradient>
                </svg>
            )
        } else if (BackgroundImage.isImageObject(fill)) {
            const imagePattern = imagePatternPropsForFill(fill, frame, id)
            if (imagePattern) {
                style.fill = `url(#${imagePattern.id})`
                fillElement = (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        width="100%"
                        height="100%"
                        style={{ position: "absolute" }}
                    >
                        <defs>
                            <ImagePatternElement {...imagePattern} />
                        </defs>
                    </svg>
                )
            }
        }

        return (
            <div id={id} style={style}>
                {fillElement}
                <div
                    key={BackgroundImage.isImageObject(fill) ? fill.src : ""} // Webkit doesn't update when a new image is set
                    className={"svgContainer"}
                    style={innerStyle}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>
        )
    }
}
