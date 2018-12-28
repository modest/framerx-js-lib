import { NavigationTransitionOptions } from "../../components/NavigationTransitions"

/**
 * @internal
 */
export enum NavigateTo {
    Previous = "@Previous",
}

/**
 * @internal
 */
export type NavigationTarget = string | NavigateTo.Previous

/**
 * @internal
 */
export enum NavigationTransition {
    push = "push",
    instant = "instant",
    fade = "fade",
    modal = "modal",
    overlay = "overlay",
    flip = "flip",
}

/**
 * @internal
 */
export enum NavigationTransitionDirection {
    left = "left",
    right = "right",
    up = "up",
    down = "down",
}

/**
 * @internal
 */
export interface NavigationLink {
    navigationTarget: NavigationTarget
    navigationTransition: NavigationTransition
    navigationTransitionDirection: NavigationTransitionDirection
    navigationTransitionOverrides?: NavigationTransitionOptions
}
