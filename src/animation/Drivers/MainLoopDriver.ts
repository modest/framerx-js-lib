import { Animator as AnimatorInterface } from "../Animators/Animator"
import { AnimationDriver } from "./AnimationDriver"
import { RenderEnvironment, RenderTarget } from "../../render/types/RenderEnvironment"
import { MainLoop } from "../../core/Loop"

/**
 * @internal
 */
export class MainLoopAnimationDriver<
    Animator extends AnimatorInterface<Value, Options>,
    Value,
    Options
> extends AnimationDriver<Animator, Value, Options> {
    play() {
        if (RenderEnvironment.target !== RenderTarget.preview) {
            // If we're not in preview mode, don't use the animator,
            // but just call the done callback directly
            this.finishedCallback && this.finishedCallback(false)
            return
        }
        MainLoop.on("update", this.update)
    }

    cancel() {
        MainLoop.off("update", this.update)
    }

    finish() {
        MainLoop.off("update", this.update)
        super.finish()
    }
}
