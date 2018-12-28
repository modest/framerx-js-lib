import * as React from "react"
import { LayerProps, IdentityProps } from "./Layer"
import { Rect } from "../types/Rect"
import { Size } from "../types/Size"
import { componentLoader, isReactDefinition } from "../componentLoader"
import { ComponentContainerLoader } from "./ComponentContainerLoader"
import { isEqual } from "../utils/isEqual"
import { isShallowEqualArray } from "../utils/isShallowEqualArray"

export interface WithParentSize {
    parentSize: Size | null
}

// Subset of CanvasNodeCache
export interface PresentationTreeCache {
    props: any | null
    canvasZoom: number
    willChangeTransform: boolean
    reactElement: React.ReactNode | null
    codeComponentPresentation: CodeComponentPresentation | null
    placeholders: { index: number; sizes: Size[] } | null
}

export interface PresentationTree {
    rect(parentSize: Size | null): Rect
    getProps(): IdentityProps
    children?: PresentationTree[]
    cache: Partial<PresentationTreeCache>
}

// For performance, we cache the React element on the node.cache, so we only have to create elements
// for nodes that actually changed. Which is a 10x speedup.
function reactConverter<P extends LayerProps>(componentForNode: (node: PresentationTree) => React.ComponentType<P>) {
    return function(node: PresentationTree, children?: React.ReactNode[]) {
        const cache = node.cache

        if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeCreateElement()

        let props = cache.props
        if (!props) {
            if (process.env.NODE_ENV !== "production" && window["perf"]) window["perf"].nodeGetProps()
            props = cache.props = node.getProps()
        }

        const canvasZoom = cache.canvasZoom
        const willChangeTransform = cache.willChangeTransform
        if (canvasZoom || willChangeTransform) {
            props = { ...props, canvasZoom, willChangeTransform }
        }

        if (!(node instanceof CodeComponentPresentation)) {
            const component = componentForNode(node)
            return (cache.reactElement = React.createElement(component, props, children))
        } else {
            const component = componentLoader.componentForIdentifier(node.componentIdentifier)
            if (!component) {
                const error = componentLoader.errorForIdentifier(node.componentIdentifier)
                return (cache.reactElement = React.createElement(ComponentContainerLoader, {
                    key: "component-container-loader",
                    error,
                }))
            }

            if (!isReactDefinition(component)) return null

            return (cache.reactElement = React.createElement(component.class, props, children))
        }
    }
}

export function renderPresentationTree<P extends LayerProps>(
    node: PresentationTree,
    componentForNode: (node: PresentationTree) => React.ComponentType<P>
): React.ReactNode {
    return convertPresentationTree(
        node,
        reactConverter(componentForNode),
        (n: PresentationTree) => n.cache.reactElement
    )
}

export function convertPresentationTree<C, P extends LayerProps>(
    node: PresentationTree,
    converter: (node: PresentationTree, children: C[] | undefined) => C,
    getCachedNode?: (node: PresentationTree) => C | undefined
): C {
    // if there is a cached node, we use it without looking at any children etc.
    const cachedNode = getCachedNode && getCachedNode(node)
    if (cachedNode) return cachedNode

    // otherwise build children depth first and convert node
    let children: C[] | undefined
    if (isCodeComponentContainerPresentation(node)) {
        children = convertCodeComponentContainer(node, converter, getCachedNode)
    } else if (node.children) {
        children = node.children.map(n => convertPresentationTree(n, converter, getCachedNode))
    }
    return converter(node, children)
}

interface CodeComponentContainerPresentation extends PresentationTree {
    id: string
    codeComponentIdentifier: string
    codeOverrideIdentifier?: string
    getComponentChildren?: () => PresentationTree[]
    getCodeComponentProps?: () => object
    getComponentSlotChildren?: () => { [key: string]: PresentationTree[] }
}

function isCodeComponentContainerPresentation(value: PresentationTree): value is CodeComponentContainerPresentation {
    return !!(value as any).codeComponentIdentifier
}

function convertCodeComponentContainer<C>(
    node: CodeComponentContainerPresentation,
    converter: (node: PresentationTree, children: C[] | undefined) => C,
    getCachedNode?: (node: PresentationTree) => C | undefined
) {
    const codeComponentChildren = !!node.getComponentChildren ? node.getComponentChildren() : []
    const codeComponentSlots = !!node.getComponentSlotChildren ? node.getComponentSlotChildren() : {}

    let codeComponentPresentation: CodeComponentPresentation

    const props = node.getCodeComponentProps ? node.getCodeComponentProps() : undefined

    if (node.cache.codeComponentPresentation) {
        codeComponentPresentation = node.cache.codeComponentPresentation
        if (!isShallowEqualArray(codeComponentPresentation.children, codeComponentChildren)) {
            codeComponentPresentation.cache.reactElement = null
            codeComponentPresentation.children = codeComponentChildren
        }
        if (!isEqual(codeComponentPresentation.props, props)) {
            codeComponentPresentation.cache.reactElement = null
            codeComponentPresentation.cache.props = null
            codeComponentPresentation.props = props
        }
    } else {
        const { id: containerId, codeComponentIdentifier: identifier } = node

        node.cache.codeComponentPresentation = codeComponentPresentation = new CodeComponentPresentation(
            containerId + identifier,
            identifier,
            props,
            codeComponentChildren
        )
    }

    codeComponentPresentation.props.placeholders = node.cache.placeholders

    const slotKeys = Object.keys(codeComponentSlots)

    if (slotKeys.length) {
        codeComponentPresentation.props = { ...codeComponentPresentation.props }
        codeComponentPresentation.props.__slotKeys = slotKeys

        for (const slotKey of slotKeys) {
            const slotChildren = codeComponentSlots[slotKey].map(child =>
                convertPresentationTree(child, converter, getCachedNode)
            )
            codeComponentPresentation.props[slotKey] = slotChildren
        }
    }

    return [
        converter(
            codeComponentPresentation,
            codeComponentPresentation.children.map(child => convertPresentationTree(child, converter, getCachedNode))
        ),
    ]
}

class CodeComponentPresentation implements PresentationTree {
    cache: Partial<PresentationTreeCache> = {}

    constructor(
        private id: string,
        public componentIdentifier: string,
        public props: any,
        public children: PresentationTree[],
        public codeOverrideIdentifier?: string
    ) {}

    getProps = () => {
        return {
            ...this.props,
            id: this.id,
            key: this.id,
        }
    }

    rect = (parentSize: Size | null) => {
        // N.B. This is never called.
        return { x: 0, y: 0, width: 0, height: 0 }
    }
}
