import { Observers, Observer } from "../animation/Animatable/Observers"
import { Cancel, Animatable, Change, AnimatableObject, isAnimatable } from "../animation/Animatable"
import { TransactionId } from "../animation/Animatable/Animatable"

/**
 * @beta
 */
function ObservableObject<T extends object = object>(
    initial: Partial<T> | object = {},
    makeAnimatables = false,
    observeAnimatables = true
) {
    const unproxiedState = {}
    unproxiedState[$private] = {
        makeAnimatables,
        observeAnimatables,
        observers: new Observers<T>(),
        transactions: new Set<number>(),
    }
    const state = new Proxy(unproxiedState, sharedProxyHandler) as AnimatableObject<T>
    Object.assign(state, initial)
    return state
}

/**
 * @beta
 */
namespace ObservableObject {
    export function addObserver<T extends object>(target: T, observer: Observer<T>): Cancel {
        return target[$private].observers.add(observer)
    }
}

export { ObservableObject }

class ObservableObjectProxyHandler<T extends object> implements ProxyHandler<T> {
    set = (target: object, key: PropertyKey, value: any, receiver: any): boolean => {
        if (key === $private) {
            return false
        }
        const privateObject = target[$private]

        let animatable: Animatable<any> | undefined
        let rawValue: any

        if (isAnimatable(value)) {
            animatable = value
            rawValue = animatable.get()
        } else {
            rawValue = value
        }

        // With the animatable flag, make every value animatable
        if (privateObject.makeAnimatables && typeof value !== "function" && typeof value !== "object" && !animatable) {
            animatable = Animatable(value)
        }

        if (privateObject.observeAnimatables && animatable) {
            const transactions = privateObject.transactions
            animatable.onUpdate({
                update: (change: Change<any>, transaction?: TransactionId) => {
                    if (transaction) {
                        transactions.add(transaction)
                    }
                    privateObject.observers.notify({ value: receiver }, transaction)
                },
                finish: (transaction: TransactionId) => {
                    if (transactions.delete(transaction)) {
                        privateObject.observers.finishTransaction(transaction)
                    }
                },
            })
        }

        let result = false
        if (target[key]) {
            // If the key already exists handle it differently
            if (isAnimatable(target[key])) {
                target[key].set(rawValue)
            } else {
                target[key] = rawValue
            }
            result = true
        } else {
            // Use the animatable value if it exists
            if (animatable) {
                value = animatable
            }
            result = Reflect.set(target, key, value)
        }
        privateObject.observers.notify({ value: receiver })
        return result
    }

    get = (target: T, key: PropertyKey, receiver: any) => {
        if (key === $private) {
            return target[key]
        }
        const value = Reflect.get(target, key, receiver)
        // Bind functions to the receiver, so we can use `this`
        return typeof value === "function" ? value.bind(receiver) : value
    }

    deleteProperty(target: T, key: PropertyKey) {
        const result = Reflect.deleteProperty(target, key)
        target[$private].observers.notify({ value: target })
        return result
    }

    ownKeys(target: T) {
        const keys = Reflect.ownKeys(target)
        const privateIndex = keys.indexOf($private)
        if (privateIndex !== -1) {
            keys.splice(privateIndex, 1)
        }
        return keys
    }

    getOwnPropertyDescriptor(target: T, key: PropertyKey) {
        if (key === $private) {
            return undefined
        }
        return Reflect.getOwnPropertyDescriptor(target, key)
    }
}

// Shared handler
const sharedProxyHandler = new ObservableObjectProxyHandler()

const $private = Symbol("private")
