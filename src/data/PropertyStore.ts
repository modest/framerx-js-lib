import { Observer } from "../animation/Animatable/Observers"
import { Cancel, AnimatableObject } from "../animation/Animatable"
import { ObservableObject } from "./ObservableObject"
import { deprecationWarning } from "../utils/deprecation"

/**
 * @beta
 * @deprecated Use Data instead
 */
export function PropertyStore<T extends object = object>(
    initial: Partial<T> | object = {},
    makeAnimatables = false
): AnimatableObject<T> {
    deprecationWarning("PropertyStore", "1.0.0", "Data() or ObservableObject()")
    return ObservableObject(initial, makeAnimatables)
}

/**
 * @beta
 * @deprecated Use Data instead
 */
export namespace PropertyStore {
    export function addObserver<T extends object>(target: T, observer: Observer<T>): Cancel {
        return ObservableObject.addObserver(target, observer)
    }
}
