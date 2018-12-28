import * as React from "react"
import { Navigator, NavigatorContext } from "../Navigation"
import { NavigationTransition, NavigationTransitionDirection } from "../../render"
const hoistNonReactStatic = require("hoist-non-react-statics")
import { NavigationTransitionOptions } from "../NavigationTransitions"

/**
 * @internal
 */
export interface WithNavigator {
    navigator: null | Navigator
}
/**
 * @internal
 */
export function WithNavigator<T, BaseProps extends React.ClassAttributes<T> & WithNavigator>(
    BaseComponent: React.ComponentType<BaseProps & { onTap?: any }>,
    navigationTransition: string,
    navigationTransitionDirection: NavigationTransitionDirection,
    navigationComponent: (() => React.ReactNode) | undefined,
    navigationTransitionOverrides?: NavigationTransitionOptions // FIXME: The ordering of these arguments is off because we need backwards compatibility with Vekter
): React.ComponentClass<BaseProps & WithNavigator> {
    const withNavigator = class extends React.Component<BaseProps> {
        render() {
            return (
                <NavigatorContext.Consumer>
                    {(navigator: null | Navigator) => {
                        const navigate = () => {
                            if (navigator) {
                                if (navigationTransition === "goBack") {
                                    navigator.goBack()
                                } else if (navigationComponent) {
                                    const component = navigationComponent()
                                    switch (navigationTransition) {
                                        case NavigationTransition.instant:
                                            navigator.instant(component)
                                            break
                                        case NavigationTransition.fade:
                                            navigator.fade(component)
                                            break
                                        case NavigationTransition.modal:
                                            navigator.modal(component, navigationTransitionOverrides)
                                            break
                                        case NavigationTransition.push:
                                            switch (navigationTransitionDirection) {
                                                case NavigationTransitionDirection.down:
                                                    navigator.pushDown(component)
                                                    break
                                                case NavigationTransitionDirection.up:
                                                    navigator.pushUp(component)
                                                    break
                                                case NavigationTransitionDirection.left:
                                                    navigator.pushLeft(component)
                                                    break
                                                case NavigationTransitionDirection.right:
                                                    navigator.pushRight(component)
                                                    break
                                            }
                                            break
                                        case NavigationTransition.overlay:
                                            switch (navigationTransitionDirection) {
                                                case NavigationTransitionDirection.down:
                                                    navigator.overlayTop(component, navigationTransitionOverrides)
                                                    break
                                                case NavigationTransitionDirection.up:
                                                    navigator.overlayBottom(component, navigationTransitionOverrides)
                                                    break
                                                case NavigationTransitionDirection.left:
                                                    navigator.overlayRight(component, navigationTransitionOverrides)
                                                    break
                                                case NavigationTransitionDirection.right:
                                                    navigator.overlayLeft(component, navigationTransitionOverrides)
                                                    break
                                            }
                                            break
                                        case NavigationTransition.flip:
                                            switch (navigationTransitionDirection) {
                                                case NavigationTransitionDirection.down:
                                                    navigator.flipDown(component)
                                                    break
                                                case NavigationTransitionDirection.up:
                                                    navigator.flipUp(component)
                                                    break
                                                case NavigationTransitionDirection.left:
                                                    navigator.flipLeft(component)
                                                    break
                                                case NavigationTransitionDirection.right:
                                                    navigator.flipRight(component)
                                                    break
                                            }
                                            break
                                    }
                                }
                            }
                        }

                        // Invoke the component's normal onTap as well as the navigation function
                        const combinedProps = { ...(this.props as any) }
                        const onTap = combinedProps.onTap
                        if (onTap) {
                            combinedProps.onTap = () => {
                                onTap.apply(this, arguments)
                                navigate.apply(this, arguments)
                            }
                        } else {
                            combinedProps.onTap = navigate
                        }
                        return <BaseComponent {...combinedProps} />
                    }}
                </NavigatorContext.Consumer>
            )
        }
    }

    hoistNonReactStatic(withNavigator, BaseComponent)
    return withNavigator
}
