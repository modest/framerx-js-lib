import * as React from "react"
import {
    Frame,
    Vector,
    VectorGroup,
    SVG,
    Text,
    ComponentContainer,
    PropertyControls,
    ConstraintProperties,
    Size,
    ConstraintValues,
    Rect,
    WithFractionOfFreeSpace,
    componentLoader,
    isReactDefinition,
} from "./"
import { isArray } from "../utils/utils"
import { ConstraintDimension } from "./types/Constraints"

/**
 * @internal
 */
export type PropertyTree = {
    componentClass?: string
    name?: string | null
    children?: PropertyTree[]
    props?: any
}

/**
 * @internal
 */
export class CanvasStore {
    canvas: PropertyTree = { children: [] }
    listeners: React.Component[] = []
    ids: string[] = []

    static __shared: CanvasStore | null = null
    static shared(data?: PropertyTree): CanvasStore {
        if (data) {
            const store = new CanvasStore()
            store.setCanvas(data)
            return store
        }
        if (!CanvasStore.__shared) {
            CanvasStore.__shared = new CanvasStore()
        }
        return CanvasStore.__shared
    }

    updateNode(presentationNode: PropertyTree) {
        const id = presentationNode.props.id
        let children = this.canvas.children
        if (!children) {
            this.canvas.children = children = []
        }

        let found = false
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (child.props.id === id) {
                found = true
                children[i] = presentationNode
                break
            }
        }
        if (!found) {
            children.push(presentationNode)
        }
        this.setCanvas(this.canvas)
    }
    setCanvas(canvas: PropertyTree) {
        if (!canvas.children) return
        this.canvas = canvas
        this.listeners.forEach((l, at) => {
            const id = this.ids[at]
            const data = findNodeFor(canvas, id)
            l.setState({ data })
        })
    }
    registerListener(listener: React.Component, idOrName: string): PropertyTree | null {
        this.listeners.push(listener)
        this.ids.push(idOrName)
        return findNodeFor(this.canvas, idOrName)
    }
    removeListener(listener: React.Component) {
        const at = this.listeners.indexOf(listener)
        if (at < 0) return
        this.listeners.splice(at, 1)
        this.ids.splice(at, 1)
    }
}

/**
 * @internal
 */
const buildInComponents = { Frame, Vector, VectorGroup, SVG, Text, ComponentContainer }

/**
 * check via the react fiber all our parents, and if this component class is a parent
 * @internal
 */
export function hasSelfInParentChain(self: React.Component): boolean {
    const constructor = self.constructor
    let fiber = (self as any)._reactInternalFiber
    if (!fiber) {
        // tslint:disable-next-line:no-console
        console.warn("_reactInternalFiber not found for:", self)
        return false
    }

    // start from our parent
    fiber = fiber.return
    while (fiber) {
        const stateNode = fiber.stateNode
        if (stateNode && stateNode.constructor === constructor) return true
        fiber = fiber.return
    }
    return false
}

class DesignComponent<P> extends React.Component<P & Partial<ConstraintProperties>, { data: any }> {
    checkedParent = false
    parentError = false
    hasParentError() {
        if (!this.checkedParent) {
            this.checkedParent = true
            this.parentError = hasSelfInParentChain(this)
        }
        return this.parentError
    }
    componentWillUnmount() {
        CanvasStore.shared().removeListener(this)
    }
    _typeForName(name: any) {
        const buildin = buildInComponents[name]
        if (buildin) return buildin

        const codeComponent = componentLoader.componentForIdentifier(name)
        if (codeComponent && isReactDefinition(codeComponent)) {
            return codeComponent.class
        }

        return Frame
    }
    _createElement(type: any, props: any, children: any[]) {
        return React.createElement(type, props, children)
    }
    _renderData(presentation: any, componentProps: any, topLevelProps?: any) {
        window["__checkBudget__"]()
        // notice, we don't own the presentation tree, but share it with all instances
        // so we have to be careful not to mutate any aspect of it
        const { componentClass, name } = presentation
        let { props, children } = presentation
        const type = this._typeForName(componentClass)
        if (!type) return null
        if (topLevelProps) props = { ...props, ...topLevelProps }

        if (name && componentProps.hasOwnProperty(name)) {
            if (componentClass === "Text") {
                const text = componentProps[name]
                if (text) {
                    props = { ...props, text: componentProps[name] }
                }
            } else {
                const orig = props.background
                const background = { src: componentProps[name], fit: orig.fit }
                props = { ...props, background }
            }
        }
        children = children ? children.map((child: any) => this._renderData(child, componentProps)) : []
        return this._createElement(type, props, children)
    }
    render() {
        window["__checkBudget__"]()
        if (this.hasParentError()) {
            return React.createElement(
                "div",
                { style: errorStyle },
                React.createElement("p", { style: errorMessageStyle }, "Design Component cannot be nested in itself.")
            )
        }
        const data = this.state.data
        if (!data) {
            return React.createElement(
                "div",
                { style: errorStyle },
                React.createElement("p", { style: errorMessageStyle }, "Unable to connect to canvas data store.")
            )
        }
        return this._renderData(this.state.data, this.props, this.props)
    }
}

/**
 * @internal
 */
function findNodeFor(presentation: PropertyTree, id: string): PropertyTree | null {
    if (!presentation) return null
    const { name, props, children } = presentation
    if (props && props.id === id) return presentation
    if (name === id) return presentation
    if (!children || !isArray(children)) return null
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const result = findNodeFor(child, id)
        if (result) return result
    }
    return null
}

/**
 * @internal
 */
export function createDesignComponent<P>(
    canvas: CanvasStore,
    id: string,
    propertyControls: PropertyControls<P>,
    width: ConstraintDimension = 100,
    height: ConstraintDimension = 100
) {
    return class extends DesignComponent<P> {
        static propertyControls: PropertyControls<P> = propertyControls
        static supportsConstraints = true
        static defaultProps: ConstraintProperties = {
            left: null,
            right: null,
            top: null,
            bottom: null,
            centerX: "50%",
            centerY: "50%",
            aspectRatio: null,
            parentSize: null,
            width,
            height,
        }
        static rect(props: Partial<ConstraintProperties>): Rect {
            const constraintValues = ConstraintValues.fromProperties(props)
            return ConstraintValues.toRect(constraintValues, props.parentSize || null, null)
        }
        static minSize(props: Partial<ConstraintProperties>, parentSize: any): Size {
            const constraintValues = ConstraintValues.fromProperties(props)
            return ConstraintValues.toMinSize(constraintValues, parentSize || null)
        }
        static size(props: Partial<ConstraintProperties>, parentSize: any, freeSpace: WithFractionOfFreeSpace): Size {
            const constraintValues = ConstraintValues.fromProperties(props)
            return ConstraintValues.toSize(constraintValues, parentSize || null, null, freeSpace)
        }
        constructor(props: P & Partial<ConstraintProperties>, context?: any) {
            super(props, context)
            const data = canvas.registerListener(this, id)
            this.state = { data }
        }
    }
}

const errorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 85, .1)",
    fontSize: "11px",
    lineHeight: "1.2em",
}

const errorMessageStyle: React.CSSProperties = {
    listStyle: "disc inside",
    margin: 0,
    padding: 0,
    paddingLeft: 0,
    color: "rgba(255, 0, 85, .5)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textAlign: "left",
}
