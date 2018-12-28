import * as React from "react"
import { Editor, EditorState, ContentState, convertFromRaw, RawDraftContentState } from "draft-js"
import { Layer, LayerProps } from "./Layer"
import { ConstraintProperties, ConstraintValues, UserConstraintValues } from "../types/Constraints"
import { draftStyleFunction } from "../style/draft"
import { Size } from "../types/Size"
import { Rect } from "../types/Rect"
import { RenderEnvironment } from "../types/RenderEnvironment"
import { draftBlockRendererFunction } from "./TextBlock"
import { FilterProperties, collectFiltersFromProps } from "../"
import { Shadow } from "../types/Shadow"
import { collectTextShadowsForProps } from "../style/shadow"
import { Animatable, AnimatableObject } from "../../animation/Animatable"
import { WithFractionOfFreeSpace } from "../traits/FreeSpace"
import { deviceFont } from "../../utils/environment"

/**
 * @internal
 */
export type TextAlignment = "left" | "right" | "center" | undefined
/**
 * @internal
 */
export interface TextProps extends ConstraintProperties, Partial<FilterProperties> {
    rotation: Animatable<number> | number
    visible: boolean
    name?: string
    contentState?: any /* ContentState, but api-extractor fails because of it: https://github.com/Microsoft/web-build-tools/issues/949 */
    alignment: TextAlignment
    autoSize: boolean
    clip: boolean
    size: Size
    opacity?: number
    shadows: Shadow[]
    style?: React.CSSProperties
    text?: string
    font?: string
}

/**
 * @internal
 */
export interface TextProperties extends TextProps, LayerProps {
    rawHTML?: string
}

/**
 * @internal
 */
export class Text extends Layer<TextProperties, {}> {
    static supportsConstraints = true
    static defaultTextProps: TextProps = {
        opacity: undefined,
        left: null,
        right: null,
        top: null,
        bottom: null,
        centerX: "50%",
        centerY: "50%",
        aspectRatio: null,
        parentSize: null,
        width: 1,
        height: 0,
        rotation: 0,
        clip: false,
        visible: true,
        contentState: undefined,
        alignment: undefined,
        autoSize: true,
        size: { width: 1, height: 0 },
        shadows: [],
        font: "16px " + deviceFont(),
    }

    static readonly defaultProps: TextProperties = {
        ...Layer.defaultProps,
        ...Text.defaultTextProps,
    }

    editorText: string | undefined
    private editorState: EditorState | null

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

    private editorStateForContentState(contentState?: ContentState | RawDraftContentState) {
        if (contentState) {
            if (!(contentState instanceof ContentState)) {
                contentState = convertFromRaw(contentState)
            }
            return EditorState.createWithContent(contentState)
        } else {
            return EditorState.createEmpty()
        }
    }

    componentWillReceiveProps(nextProps: TextProperties) {
        if (nextProps.contentState !== this.properties.contentState) {
            this.editorState = this.editorStateForContentState(nextProps.contentState)
        }
    }

    render() {
        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeRender()

        const {
            font,
            visible,
            rotation,
            alignment,
            autoSize,
            clip,
            size,
            opacity,
            willChangeTransform,
            id,
            _forwardedOverrides,
        } = this.properties
        const { zoom } = RenderEnvironment
        const frame = this.frame

        if (!visible) {
            return null
        }

        const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${frame.x}px, ${frame.y}px) rotate(${Animatable.getNumber(rotation).toFixed(4)}deg)`,
            // Using “auto” fixes wrapping problems where our size calculation does not work out well when zooming the
            // text (due to rendering differences).
            width: autoSize ? "auto" : `${frame.width}px`,
            minWidth: `${frame.width}px`,
            height: `${frame.height}px`,
            wordWrap: "break-word",
            outline: "none",
            display: "inline-block",
            opacity,
        }

        collectFiltersFromProps(this.props, style)

        const ignoreShadows = zoom >= 8
        if (!ignoreShadows) {
            collectTextShadowsForProps(this.properties, style)
        }

        if (opacity === 1 || opacity === undefined) {
            // Wipe opacity setting if it's the default (1 or undefined)
            delete style.opacity
        }

        if (willChangeTransform) {
            style.willChange = "transform"
        }

        // Only clip text if it’s actually overflowing, else shadows might be clipped
        if (clip || (!autoSize && size.height > frame.height)) {
            style.overflow = "hidden"
        }

        let rawHTML = this.props.rawHTML
        let contentState = this.props.contentState

        let text: string | undefined = undefined
        if (id && _forwardedOverrides) {
            text = _forwardedOverrides[id]
        } else {
            text = this.props.text
        }

        if (text) {
            if (rawHTML) {
                rawHTML = replaceHTMLWithText(rawHTML, text)
            } else if (contentState) {
                contentState = replaceContentStateWithText(contentState, text)
            } else {
                rawHTML = `<p style="font: ${font}">${text}</p>`
            }
        }

        if (rawHTML) {
            style.textAlign = alignment
            style.whiteSpace = "pre-wrap"
            style.wordWrap = "break-word"
            style.lineHeight = "1px"
            // style.backgroundColor = "yellow"
            return <div style={style} dangerouslySetInnerHTML={{ __html: rawHTML }} />
        }

        if (this.props.style) {
            Object.assign(style, this.props.style)
        }

        if (!this.editorState || this.editorText !== text) {
            this.editorText = text
            this.editorState = this.editorStateForContentState(contentState)
        }

        return (
            <div style={style}>
                <Editor
                    editorState={this.editorState}
                    onChange={this.onChange}
                    readOnly={true}
                    customStyleFn={draftStyleFunction(autoSize)}
                    blockRendererFn={draftBlockRendererFunction(false, alignment)}
                    textAlignment={alignment}
                />
            </div>
        )
    }

    private onChange = (_: EditorState) => {
        // NOOP
    }
}

function replaceHTMLWithText(rawHTML: string, text: string): string {
    const orig = rawHTML.split('<span data-text="true">')
    return orig[0] + '<span data-text="true">' + text + "</span></span>"
}

function replaceContentStateWithText(contentState: any, text: string): any {
    const block0 = contentState.blocks[0] || { inlineStyleRanges: [] }
    const length = text.length
    const inlineStyleRanges: any[] = []
    block0.inlineStyleRanges.forEach((range: any) => {
        if (range.offset !== 0) return
        inlineStyleRanges.push({ ...range, length })
    })
    return { blocks: [{ ...block0, text, inlineStyleRanges }], entityMap: {} }
}
