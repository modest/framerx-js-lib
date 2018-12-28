import * as React from "react"
import { isConstraintSupportingClass, isConstraintSupportingChild } from "../types/Constraints"
import { Animatable, Cancel, AnimatableObject, Change } from "../../animation/Animatable"
import { WithParentSize } from "./PresentationTree"
import { ObservableObject } from "../../data/ObservableObject"
import { Size } from "../types/Size"
const hoistNonReactStatic = require("hoist-non-react-statics")

/**
 * @internal
 */
export interface WithSize {
    width?: number
    height?: number
}

interface State extends WithSize {
    sizeObserver: AnimatableObject<Size> | null
}

/**
 * @internal
 */
export function SetSizeAndPositionChildren<TOriginalProps extends WithSize, BaseProps extends TOriginalProps>(
    BaseComponent: React.ComponentType<BaseProps>
): React.ComponentClass<BaseProps & WithParentSize> {
    type Props = BaseProps & WithParentSize

    const baseComponentSupportsConstraints = isConstraintSupportingClass(BaseComponent)

    const unwrappedParentSize = class Unwrap extends React.Component<Props, State> {
        static supportsConstraints = true
        state: State = {
            sizeObserver: null,
            width: undefined,
            height: undefined,
        }

        // Not hoisted by `hoistNonReactStatic`
        static defaultProps = Object.assign({}, BaseComponent.defaultProps) as Partial<Props>

        cancelObserver: Cancel | undefined

        static getDerivedStateFromProps(props: Props, previousState: State): State | null {
            if (baseComponentSupportsConstraints) {
                return null
            }
            const parentSize: Size | null = props.parentSize
            if (!parentSize) {
                return { sizeObserver: null, width: undefined, height: undefined }
            }
            const width = Animatable.getNumber(parentSize.width)
            const height = Animatable.getNumber(parentSize.height)
            if (previousState.sizeObserver === null) {
                return { sizeObserver: ObservableObject(parentSize, true), width: width, height: height }
            }
            if (previousState.width === width && previousState.height === height) {
                return null
            }
            previousState.sizeObserver.width = width
            previousState.sizeObserver.height = height
            // The state observer already causes a state change, so no need to change it here
            return null
        }

        componentDidMount() {
            if (baseComponentSupportsConstraints) {
                return
            }
            const sizeObserver = this.state.sizeObserver
            if (sizeObserver !== null) {
                this.cancelObserver = ObservableObject.addObserver(sizeObserver, (change: Change<Size>) => {
                    this.setState({
                        width: Animatable.getNumber(change.value.width),
                        height: Animatable.getNumber(change.value.height),
                    })
                })
            }
        }

        componentWillUnmount() {
            if (this.cancelObserver) {
                this.cancelObserver()
            }
        }

        render() {
            const children = React.Children.map(this.props.children, (child: React.ReactChild, index: number) => {
                if (isConstraintSupportingChild(child)) {
                    return React.cloneElement(child, { left: 0, top: 0, bottom: null, right: null })
                }
                return child
            })
            const size: Partial<Size> = {}
            let props = this.props

            if (!baseComponentSupportsConstraints) {
                const { parentSize, ...remaining } = this.props as any
                props = remaining
                size.width = this.state.width
                size.height = this.state.height
            }
            return (
                <BaseComponent {...props} {...size}>
                    {children}
                </BaseComponent>
            )
        }
    }
    hoistNonReactStatic(unwrappedParentSize, BaseComponent)
    return unwrappedParentSize
}
