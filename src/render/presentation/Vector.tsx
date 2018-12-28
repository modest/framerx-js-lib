import * as React from "react"
import { transformString } from "../utils/transformString"
import { Layer, LayerProps } from "./Layer"
import { SVGRoot } from "./SVGRoot"
import { Rect } from "../types/Rect"
import { StrokeAlignment } from "../types/StrokeAlignment"
import { WithPath, toSVGPath } from "../traits/Path"
import { shadowForShape } from "../style/shadow"
import { BoxShadow } from "../types/Shadow"
import { LinearGradientElement } from "./LinearGradientElement"
import { ImagePatternElement, ImagePatternElementProperties } from "./ImagePatternElement"
import { transformValues } from "../utils/createTransformValues"
import { imagePatternPropsForFill } from "../utils/imagePatternPropsForFill"
import { ConvertColor, Color } from "../types/Color"
import { svgElementAttributeDefaults } from "../types/svgElementAttributeDefaults"
import { LineCap, LineJoin } from "../types/Stroke"
import { RenderTarget } from "../types/RenderEnvironment"
import { RenderEnvironment } from "../types/RenderEnvironment"
import { FillProperties } from "../traits/Fill"
import { LinearGradient } from "../types/Gradient"
import { BackgroundImage } from "../types/BackgroundImage"
import {
    elementPropertiesForLinearGradient,
    LinearGradientElementProperties,
} from "../utils/elementPropertiesForLinearGradient"
import { InternalID } from "../../utils/internalId"

/**
 * @internal
 */
export interface VectorProps extends Partial<FillProperties> {
    isRootVectorNode: boolean
    name: string | null
    includeTransform?: boolean
    defaultFillColor?: string
    defaultStrokeColor?: string
    defaultStrokeWidth?: number
    defaultStrokeAlignment?: StrokeAlignment
    width: number
    height: number
    rotation: number
    frame: Rect
    opacity?: number
    calculatedPath: WithPath[]
    shapeId?: string
    insideStroke: boolean
    strokeEnabled: boolean
    strokeClipId?: string
    strokeWidth?: number
    idAttribute?: string
    shadows: BoxShadow[]
    rect: Rect
    strokeAlpha: number
    lineCap: LineCap
    lineJoin: LineJoin
    strokeColor: string
    strokeMiterLimit: number
    strokeDashArray: string
    strokeDashOffset: number
}

/**
 * @internal
 */
export interface VectorProperties extends VectorProps, LayerProps {}

/**
 * @internal
 */
export class Vector extends Layer<VectorProperties, {}> {
    static defaultVectorProps: VectorProps = {
        isRootVectorNode: false,
        name: null,
        includeTransform: undefined,
        defaultFillColor: undefined,
        defaultStrokeColor: undefined,
        defaultStrokeWidth: undefined,
        defaultStrokeAlignment: "center",
        width: 100,
        height: 100,
        rotation: 0,
        frame: { x: 0, y: 0, width: 100, height: 100 },
        opacity: undefined,
        calculatedPath: [],
        shapeId: undefined,
        insideStroke: false,
        strokeEnabled: true,
        strokeClipId: undefined,
        strokeWidth: undefined,
        idAttribute: undefined,
        shadows: [],
        strokeAlpha: 1,
        rect: { x: 0, y: 0, width: 0, height: 0 },
        lineCap: "butt",
        strokeColor: "#0AF",
        lineJoin: "miter",
        strokeMiterLimit: 4,
        strokeDashArray: "0",
        strokeDashOffset: 0,
        fill: "rgba(0,170,255,0.5)",
    }

    static readonly defaultProps: VectorProperties = {
        ...Layer.defaultProps,
        ...Vector.defaultVectorProps,
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()

        const {
            opacity,
            calculatedPath,
            insideStroke,
            shapeId,
            strokeEnabled,
            strokeClipId,
            strokeWidth,
            idAttribute,
            rect,
            shadows,
            strokeAlpha,
            name,
            includeTransform,
            isRootVectorNode,
            rotation,
            id,
            lineCap,
            lineJoin,
            strokeColor,
            strokeMiterLimit,
            strokeDashArray,
            strokeDashOffset,
            fill,
        } = this.properties

        // invisible shapes will result in these not being set, and should not be rendered
        if (!id || !shapeId || !strokeClipId) return null

        const { zoom, target } = RenderEnvironment
        const transform = transformValues(rect, rotation, isRootVectorNode, includeTransform)

        let vectorFill: string | undefined
        let fillAlpha = 0
        let imagePattern: ImagePatternElementProperties | undefined
        let linearGradient: LinearGradientElementProperties | undefined

        if (typeof fill === "string" || Color.isColorObject(fill)) {
            const fillColor = Color.isColorObject(fill) ? fill.initialValue || Color.toRgbString(fill) : fill
            if (fillColor !== "transparent") {
                vectorFill = fillColor
                fillAlpha = ConvertColor.getAlpha(vectorFill)
            }
        } else if (LinearGradient.isLinearGradient(fill)) {
            linearGradient = elementPropertiesForLinearGradient(fill, id)
            vectorFill = `url(#${linearGradient.id})`
            fillAlpha = 1
        } else if (BackgroundImage.isImageObject(fill)) {
            imagePattern = imagePatternPropsForFill(fill, transform, id)

            if (imagePattern) {
                vectorFill = `url(#${imagePattern.id})`
                fillAlpha = 1
            }
        }

        if (vectorFill === svgElementAttributeDefaults.fill) {
            vectorFill = undefined
        }

        if (vectorFill === undefined) {
            vectorFill = "transparent"
        }

        const fillEnabled = vectorFill !== undefined && vectorFill !== "transparent" && fillAlpha !== 0

        // If both fill and stroke are disabled, pretend there’s a fill for the shadow
        if (!fillEnabled && !strokeEnabled) {
            fillAlpha = 1
        }

        let mainElement: JSX.Element
        let strokeClipPath: JSX.Element | null = null
        let shapeReference: JSX.Element | null = null
        let strokeElement: JSX.Element | null = null

        let pathTranslate: { x: number; y: number } | undefined
        let elementTransform: string | undefined

        const translatePaths = target === RenderTarget.export
        if (transform.rotation === 0 && translatePaths) {
            pathTranslate = transform
        } else {
            pathTranslate = { x: 0, y: 0 }
            elementTransform = transformString(transform)
        }
        const pathAttributes: React.SVGProps<SVGPathElement> = {
            d: toSVGPath(calculatedPath, pathTranslate, target),
            transform: elementTransform,
        }

        // When used from the Preview, we need to revive BoxShadow instances:

        const svgStrokeAttributes: React.SVGAttributes<SVGElement> = {}
        if (strokeEnabled && strokeWidth !== 0) {
            svgStrokeAttributes.strokeWidth = strokeWidth
            svgStrokeAttributes.stroke = strokeColor
            svgStrokeAttributes.strokeLinecap = lineCap
            svgStrokeAttributes.strokeLinejoin = lineJoin
            if (lineJoin === "miter") {
                svgStrokeAttributes.strokeMiterlimit = strokeMiterLimit
            }
            svgStrokeAttributes.strokeDasharray = strokeDashArray
            if (strokeDashOffset !== 0) {
                svgStrokeAttributes.strokeDashoffset = strokeDashOffset
            }
        }

        for (const key in svgElementAttributeDefaults) {
            if (svgStrokeAttributes[key] === svgElementAttributeDefaults[key]) {
                svgStrokeAttributes[key] = undefined
            }
        }
        const internalShapeId = InternalID.forKey(shapeId)
        const internalStrokeClipId = InternalID.forKey(strokeClipId)
        const shadow = shadowForShape(
            shadows,
            rect,
            internalShapeId,
            fillAlpha,
            strokeAlpha,
            strokeWidth,
            internalStrokeClipId,
            svgStrokeAttributes,
            zoom,
            target
        )

        const currentName = target === RenderTarget.preview ? name || undefined : undefined

        if (shadow.insetElement !== null || shadow.outsetElement !== null || insideStroke) {
            pathAttributes.id = internalShapeId.id
            shapeReference = <path {...{ ...pathAttributes }} />

            if (shadow.needsStrokeClip || insideStroke) {
                strokeClipPath = (
                    <clipPath id={internalStrokeClipId.id}>
                        <use xlinkHref={internalShapeId.link} />
                    </clipPath>
                )
            }

            if (shadow.insetElement !== null && strokeEnabled && strokeWidth && strokeWidth > 0) {
                mainElement = (
                    <use xlinkHref={internalShapeId.link} fill={vectorFill} strokeOpacity="0" name={currentName} />
                )
                strokeElement = (
                    <use
                        xlinkHref={internalShapeId.link}
                        clipPath={internalStrokeClipId.urlLink}
                        fill={"transparent"}
                        {...svgStrokeAttributes}
                        strokeWidth={strokeWidth}
                    />
                )
            } else {
                mainElement = (
                    <use
                        xlinkHref={internalShapeId.link}
                        fill={vectorFill}
                        clipPath={internalStrokeClipId.urlLink}
                        {...svgStrokeAttributes}
                        strokeWidth={strokeWidth}
                        name={currentName}
                    />
                )
            }
        } else {
            pathAttributes.id = idAttribute
            mainElement = (
                <path {...{ ...pathAttributes, fill: vectorFill, ...svgStrokeAttributes }} name={currentName} />
            )
        }

        const imagePatternElement = imagePattern ? <ImagePatternElement {...imagePattern} /> : undefined
        const gradient = linearGradient ? <LinearGradientElement {...linearGradient} /> : undefined

        let defs: JSX.Element | null = null
        if (
            shapeReference ||
            strokeClipPath ||
            (shadow.definition && shadow.definition.length) ||
            gradient ||
            imagePatternElement
        ) {
            defs = (
                <defs>
                    {shapeReference}
                    {strokeClipPath}
                    {shadow.definition}
                    {gradient}
                    {imagePatternElement}
                </defs>
            )
        }

        if (defs === null && shadow.outsetElement === null && shadow.insetElement === null && strokeElement === null) {
            // Render the mainElement with opacity
            mainElement = (
                <path
                    {...{ ...pathAttributes, fill: vectorFill, opacity, ...svgStrokeAttributes }}
                    name={currentName}
                />
            )
            // Don't group the main element if not needed:
            return this.renderElement(mainElement)
        } else {
            return this.renderElement(
                <g opacity={opacity}>
                    {defs}
                    {shadow.outsetElement}
                    {mainElement}
                    {shadow.insetElement}
                    {strokeElement}
                </g>
            )
        }
    }

    renderElement(element: JSX.Element) {
        const { isRootVectorNode, width, height, frame, willChangeTransform } = this.properties

        if (!isRootVectorNode) {
            return element
        } // else

        return <SVGRoot {...{ frame, width, height, willChangeTransform }}>{element}</SVGRoot>
    }
}
