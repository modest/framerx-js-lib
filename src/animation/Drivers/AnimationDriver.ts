import { Animator as AnimatorInterface } from "../Animators/Animator"

/**
 * @internal
 */
export interface DriverClass<AnimatorClass extends AnimatorInterface<Value, Options>, Value, Options = any> {
    new (
        animator: AnimatorClass,
        updateCallback: (value: Value) => void,
        doneCallback?: (isFinished: boolean) => void
    ): AnimationDriver<AnimatorClass, Value, Options>
}

/**
 * @public
 */
export interface AnimationInterface {
    /**
     * @internal
     */
    play(): void
    cancel(): void
    /**
     * @internal
     */
    finish(): void
    isFinished(): boolean
}

/**
 * @internal
 */
export abstract class AnimationDriver<AnimatorClass extends AnimatorInterface<Value, Options>, Value, Options>
    implements AnimationInterface {
    constructor(
        public animator: AnimatorClass,
        protected updateCallback: (value: Value) => void,
        protected finishedCallback?: (isFinished: boolean) => void
    ) {
        if (!this.animator.isReady()) {
            // tslint:disable-next-line:no-console
            console.warn("AnimationDriver initialized with animator that isn't ready")
        }
    }

    abstract play(): void

    protected update = (frame: number, elapsed: number) => {
        if (this.animator.isFinished()) {
            this.finish()
        } else {
            const value = this.animator.next(elapsed)
            this.updateCallback(value)
        }
    }

    abstract cancel(): void

    finish(): void {
        if (this.finishedCallback) {
            this.finishedCallback(this.animator.isFinished())
        }
    }

    isFinished(): boolean {
        return this.animator.isFinished()
    }
}
