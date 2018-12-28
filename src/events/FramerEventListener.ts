import { environment } from "../utils"
import { TouchEventListener } from "./recognizer/TouchEventListener"
import { MouseEventListener } from "./recognizer/MouseEventListener"

/** @internal */
export const FramerEventListener: React.ComponentType<any> = environment.isTouch()
    ? TouchEventListener
    : MouseEventListener
