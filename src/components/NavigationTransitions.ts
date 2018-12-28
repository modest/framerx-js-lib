import { FrameProperties, Size } from "../render"

/**
 * @internal
 */
export interface NavigationTransitionOptions {
    fitWidth?: boolean
    fitHeight?: boolean
    transitionDuration?: number

    overCurrentContext?: boolean
    goBackOnTapOutside?: boolean
    backdropColor?: string

    inStart?(contextSize: Size, contentSize: Size): Partial<FrameProperties>
    inEnd?(contextSize: Size, contentSize: Size): Partial<FrameProperties>
    outEnd?(contextSize: Size, contentSize: Size): Partial<FrameProperties>
}

const iosDimColor = "rgba(4,4,15,.4)"

export namespace Transition {
    export const Fade: NavigationTransitionOptions = {
        transitionDuration: 0.5,

        outEnd() {
            return { opacity: 0 }
        },
        inStart() {
            return { opacity: 0 }
        },
    }

    export const PushLeft: NavigationTransitionOptions = {
        transitionDuration: 0.5,

        outEnd(contextSize: Size) {
            return { left: -100 }
        },
        inStart(contextSize: Size) {
            return { left: contextSize.width }
        },
    }

    export const PushRight: NavigationTransitionOptions = {
        transitionDuration: 0.5,

        outEnd(contextSize: Size) {
            return { left: 100 }
        },
        inStart(contextSize: Size) {
            return { left: -contextSize.width }
        },
    }

    export const PushDown: NavigationTransitionOptions = {
        transitionDuration: 0.5,

        outEnd(contextSize: Size) {
            return { top: 100 }
        },
        inStart(contextSize: Size) {
            return { top: -contextSize.height }
        },
    }

    export const PushUp: NavigationTransitionOptions = {
        transitionDuration: 0.5,

        outEnd(contextSize: Size) {
            return { top: -100 }
        },
        inStart(contextSize: Size) {
            return { top: contextSize.height }
        },
    }

    export const Instant: NavigationTransitionOptions = {
        transitionDuration: 0,
    }

    export const Modal: NavigationTransitionOptions = {
        fitWidth: false,
        fitHeight: false,
        transitionDuration: 0.2,

        overCurrentContext: true,
        backdropColor: iosDimColor,

        inEnd(contextSize: Size, contentSize: Size) {
            return { ...getTopLeft(contextSize, contentSize), opacity: 1, scale: 1 }
        },
        inStart(contextSize: Size, contentSize: Size) {
            return { ...getTopLeft(contextSize, contentSize, 10), opacity: 0, scale: 1.2 }
        },
    }

    export const OverlayTop: NavigationTransitionOptions = {
        fitHeight: false,

        overCurrentContext: true,
        backdropColor: iosDimColor,
        goBackOnTapOutside: true,

        inStart(contextSize: Size, contentSize: Size) {
            return { top: -contentSize.height, left: 0 }
        },
    }

    export const OverlayBottom: NavigationTransitionOptions = {
        fitHeight: false,

        overCurrentContext: true,
        backdropColor: iosDimColor,
        goBackOnTapOutside: true,

        inEnd(contextSize: Size, contentSize: Size) {
            return { top: contextSize.height - contentSize.height }
        },
        inStart(contextSize: Size, contentSize: Size) {
            return { top: contextSize.height }
        },
    }

    export const OverlayLeft: NavigationTransitionOptions = {
        fitWidth: false,

        overCurrentContext: true,
        backdropColor: iosDimColor,
        goBackOnTapOutside: true,

        inStart(contextSize: Size, contentSize: Size) {
            return { left: -contentSize.width }
        },
    }

    export const OverlayRight: NavigationTransitionOptions = {
        fitWidth: false,

        overCurrentContext: true,
        backdropColor: iosDimColor,
        goBackOnTapOutside: true,

        inEnd(contextSize: Size, contentSize: Size) {
            return { left: contextSize.width - contentSize.width }
        },
        inStart(contextSize: Size, contentSize: Size) {
            return { left: contextSize.width }
        },
    }

    export const FlipLeft: NavigationTransitionOptions = {
        fitWidth: true,
        fitHeight: true,
        transitionDuration: 0.5,

        outEnd() {
            return { rotationY: -180 }
        },
        inStart() {
            return { rotationY: 180 }
        },
    }

    export const FlipRight: NavigationTransitionOptions = {
        fitWidth: true,
        fitHeight: true,
        transitionDuration: 0.5,

        outEnd() {
            return { rotationY: 180 }
        },
        inStart() {
            return { rotationY: -180 }
        },
    }

    export const FlipDown: NavigationTransitionOptions = {
        fitWidth: true,
        fitHeight: true,
        transitionDuration: 0.5,

        outEnd() {
            return { rotationX: -180 }
        },
        inStart() {
            return { rotationX: 180 }
        },
    }

    export const FlipUp: NavigationTransitionOptions = {
        fitWidth: true,
        fitHeight: true,
        transitionDuration: 0.5,

        outEnd() {
            return { rotationX: 180 }
        },
        inStart() {
            return { rotationX: -180 }
        },
    }
}

function getTopLeft(contextSize: Size, contentSize: Size, yOffset = 0) {
    return {
        left: (contextSize.width - contentSize.width) / 2,
        top: (contextSize.height - contentSize.height) / 2 + yOffset,
    }
}
