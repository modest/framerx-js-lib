import * as React from "react"
import { transformString } from "../utils/transformString"
import { LayerProps, Layer } from "./Layer"
import { SVGRoot } from "./SVGRoot"
import { Rect } from "../types/Rect"
import { transformValues } from "../utils/createTransformValues"
import { RenderTarget } from "../types/RenderEnvironment"
import { RenderEnvironment } from "../types/RenderEnvironment"

/**
 * @alpha
 */
export interface VectorGroupProps {
    name?: string
    opacity?: number | string
    visible: boolean
    x: number
    y: number
    rotation: number
    width: number
    height: number
    targetName?: string
    defaultName: string
    isRootVectorNode: boolean
    frame: Rect
    includeTransform?: boolean
}
/**
 * @alpha
 */
export interface VectorGroupProperties extends VectorGroupProps, LayerProps {}

/**
 * @internal
 */
export class VectorGroup extends Layer<VectorGroupProperties, {}> {
    static defaultVectorGroupProps: VectorGroupProps = {
        name: undefined,
        opacity: undefined,
        visible: true,
        x: 0,
        y: 0,
        rotation: 0,
        width: 100,
        height: 100,
        targetName: undefined,
        defaultName: "",
        isRootVectorNode: false,
        includeTransform: undefined,
        frame: { x: 0, y: 0, width: 100, height: 100 },
    }

    static readonly defaultProps: VectorGroupProperties = {
        ...Layer.defaultProps,
        ...VectorGroup.defaultVectorGroupProps,
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()

        const {
            id,
            name,
            opacity,
            visible,
            targetName,
            defaultName,
            children,
            includeTransform,
            x,
            y,
            width,
            height,
            rotation,
            isRootVectorNode,
        } = this.properties

        if (!visible) return null
        const { target } = RenderEnvironment

        const rect = { x, y, width, height }
        const transform = transformValues(rect, rotation, isRootVectorNode, includeTransform)

        const addNames = target === RenderTarget.preview
        let name_: string | undefined = undefined
        if (addNames) {
            if (targetName) {
                name_ = targetName
            } else if (name) {
                name_ = name
            } else {
                name_ = defaultName
            }
        }

        return this.renderElement(
            <g transform={transformString(transform)} {...{ id, name: name_, opacity }}>
                {children}
            </g>
        )
    }

    renderElement(element: JSX.Element) {
        const { isRootVectorNode, width, height, frame, willChangeTransform } = this.properties

        if (!isRootVectorNode) {
            return element
        } // else

        return <SVGRoot {...{ frame, width, height, willChangeTransform }}>{element}</SVGRoot>
    }
}
