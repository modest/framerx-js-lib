import { Observer } from "../animation/Animatable/Observers"
import { Cancel } from "../animation/Animatable"
import { ObservableObject } from "./ObservableObject"

/**
 * @public
 */
export function Data<T extends object = object>(initial: Partial<T> | object = {}): T {
    // Because of the second boolean is set to false we already know that everything will have the same type as the input
    const data: T = ObservableObject(initial, false, false) as any
    Data.addData(data)
    return data
}

/**
 * @public
 */
export namespace Data {
    /**
     * @internal
     */
    export let _stores: object[] = []
    /** @internal */
    export function addData(data: object) {
        _stores.push(data)
    }
    /** @internal */
    export function addObserver<T extends object>(target: T, observer: Observer<T>): Cancel {
        return ObservableObject.addObserver(target, observer)
    }
}
