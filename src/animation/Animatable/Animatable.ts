import { UpdateObserver, Observers, Observer, FinishFunction } from "./Observers"
import { Interpolation } from "../../interpolation/Interpolation"

/** @public */
export type Cancel = () => void

/**
 * @public
 */
export type TransactionId = number
export interface Change<Value> {
    value: Value
    oldValue?: Value
}

export type ToAnimatable<PossiblyAnimatable> = PossiblyAnimatable extends Animatable<infer Value>
    ? Animatable<Value>
    : Animatable<PossiblyAnimatable>

export type FromAnimatable<PossiblyAnimatable> = PossiblyAnimatable extends Animatable<infer Value>
    ? Value
    : PossiblyAnimatable

export type ToAnimatableOrValue<PossiblyAnimatable> = PossiblyAnimatable extends Animatable<infer Value>
    ? Value | Animatable<Value>
    : PossiblyAnimatable | Animatable<PossiblyAnimatable>

/** @public */
export type AnimatableObject<T> = { [K in keyof T]: ToAnimatableOrValue<T[K]> }

/**
 * @public
 */
export interface Animatable<Value> extends UpdateObserver<Value> {
    get(): Value
    set(value: Value | Animatable<Value>): void
    set(value: Value | Animatable<Value>, transaction?: TransactionId): void
    /**
     * @alpha
     */
    finishTransaction(transaction: TransactionId): FinishFunction[]
}

/**
 * @public
 */
export function Animatable<Value>(value: Value | Animatable<Value>): Animatable<Value> {
    return isAnimatable(value) ? value : new AnimatableValue(value)
}

/**
 * @public
 */
export namespace Animatable {
    /**
     * @alpha
     */
    export function transaction(
        update: (updater: (animatable: Animatable<any>, value: any) => void, transactionId: TransactionId) => void
    ): void {
        const transactionId = Math.random()
        const updatedValues: Set<Animatable<any>> = new Set()
        const updater = (animatable: Animatable<any>, value: any): void => {
            animatable.set(value, transactionId)
            updatedValues.add(animatable)
        }
        update(updater, transactionId)
        const finishObservers: FinishFunction[] = []
        updatedValues.forEach(value => {
            finishObservers.push(...value.finishTransaction(transactionId))
        })
        finishObservers.forEach(finish => {
            finish(transactionId)
        })
    }

    /**
     * @public
     */
    export function getNumber(value: number | Animatable<number> | null | undefined, defaultValue: number = 0): number {
        return Animatable.get(value, defaultValue)
    }

    /**
     * @public
     */
    export function get<Value>(value: Value | Animatable<Value> | null | undefined, defaultValue: Value): Value {
        if (!value) {
            return defaultValue
        }
        if (isAnimatable(value)) {
            return value.get()
        }
        return value
    }

    /**
     * @internal
     */
    export function objectToValues<Object>(object: AnimatableObject<Object>): Object {
        if (!object) {
            return object
        }
        const result: any = {}
        for (const key in object) {
            const value = object[key]
            if (isAnimatable(value)) {
                result[key] = value.get()
            } else {
                result[key] = value
            }
        }
        return result
    }
}

const onUpdateKey: keyof AnimatableValue = "onUpdate"
const finishTransactionKey: keyof AnimatableValue = "finishTransaction"
export function isAnimatable(value: any): value is Animatable<any> {
    return (
        value !== null &&
        typeof value === "object" &&
        onUpdateKey in value &&
        value[onUpdateKey] instanceof Function &&
        finishTransactionKey in value &&
        value[finishTransactionKey] instanceof Function
    )
}

function animatableInterpolation<Value>(
    value: Animatable<Value>,
    currentInterpolation: Interpolation<any>
): Interpolation<Animatable<Value>> {
    return {
        interpolate(from: Animatable<Value>, to: Animatable<Value>): ((progress: number) => Animatable<Value>) {
            const fromValue = from.get()
            const toValue = to.get()
            const result = Animatable(fromValue)

            return (progress: number): Animatable<any> => {
                const v = currentInterpolation.interpolate(fromValue, toValue)(progress)
                result.set(v)
                return result
            }
        },
        difference(from: Animatable<Value>, to: Animatable<Value>): number {
            const v = from.get()
            return currentInterpolation.difference(v, to.get())
        },
    }
}

class AnimatableValue<Value = any> implements Animatable<Value> {
    private observers = new Observers()

    constructor(private value: Value) {}

    static interpolationFor<Value>(
        value: any,
        currentInterpolation: Interpolation<any>
    ): Interpolation<Animatable<Value>> | undefined {
        if (isAnimatable(value)) {
            return animatableInterpolation<Value>(value, currentInterpolation)
        }
    }

    get(): Value {
        return this.value
    }

    set(value: Value | Animatable<Value>, transaction?: TransactionId) {
        const oldValue = this.value
        if (isAnimatable(value)) {
            value = value.get()
        }
        this.value = value
        const change = {
            value,
            oldValue,
        }
        this.observers.notify(change, transaction)
    }

    finishTransaction(transaction: TransactionId) {
        return this.observers.finishTransaction(transaction)
    }

    onUpdate(handler: Observer<Value>): Cancel {
        return this.observers.add(handler)
    }
}
