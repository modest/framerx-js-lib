import { Animator } from "./Animator"

export const Defaults = {
    delta: 1 / 60,
    maxValues: 10000,
}

export type PrecalculationOptions = typeof Defaults

export type RequiredOptions<Value> = {
    animator: Animator<Value>
}

export type Options<Value> = Partial<PrecalculationOptions> & RequiredOptions<Value>

/**
 * @internal
 */
export class PrecalculatedAnimator<Value> implements Animator<Value, Options<Value>> {
    private animator: Animator<Value>
    values: Value[]
    private currentTime = 0
    private totalTime: number
    private options: PrecalculationOptions & RequiredOptions<Value>
    constructor(options: Options<Value>) {
        this.options = { ...Defaults, ...options }
        this.animator = options.animator
    }

    private preCalculate() {
        if (!this.animator.isReady()) {
            return
        }
        const { delta } = this.options
        this.values = []
        while (!this.animator.isFinished() && this.values.length < this.options.maxValues) {
            let value = this.animator.next(this.options.delta)
            if (typeof value === "object" && value) {
                const object = value as any
                const copy = { ...object }
                value = copy as Value
            }
            this.values.push(value)
        }
        this.totalTime = this.values.length * delta
    }

    private indexForTime(time: number): number {
        return Math.max(
            0,
            Math.min(this.values.length - 1, Math.round(this.values.length * (time / this.totalTime)) - 1)
        )
    }

    setFrom(value: Value): void {
        this.animator.setFrom(value)
        this.preCalculate()
    }

    setTo(end: Value): void {
        this.animator.setTo(end)
        this.preCalculate()
    }

    isReady(): boolean {
        return this.values !== undefined && this.values.length > 0 && this.totalTime > 0
    }

    next(delta: number): Value {
        this.currentTime += delta
        const index = this.indexForTime(this.currentTime)
        return this.values[index]
    }

    isFinished(): boolean {
        return this.totalTime === 0 || this.currentTime >= this.totalTime
    }

    get endValue(): Value {
        this.preCalculate()
        const index = this.indexForTime(this.totalTime)
        return this.values.length > 0 ? this.values[index] : this.animator.next(0)
    }
}
