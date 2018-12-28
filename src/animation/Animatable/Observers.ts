import { Cancel, TransactionId, Change } from "./Animatable"

/**
 * @public
 */
export type UpdateFunction<Value> = (change: Change<Value>, transaction?: TransactionId) => void
/**
 * @public
 */
export type FinishFunction = (transaction: TransactionId) => void
/**
 * @public
 */
export type Observer<Value> =
    | {
          update: UpdateFunction<Value>
          finish: FinishFunction
      }
    | UpdateFunction<Value>

/**
 * @public
 */
export interface UpdateObserver<Value> {
    onUpdate(handler: Observer<Value>): Cancel
}

/**
 * @internal
 */
export class Observers<Value> {
    private observers: Set<Observer<Value>> = new Set()
    private transactions: { [key: number]: Change<Value> } = {}
    add(observer: Observer<Value>): Cancel {
        this.observers.add(observer)
        let isCalled = false
        return () => {
            if (isCalled) {
                return
            }
            isCalled = true
            this.remove(observer)
        }
    }

    private remove(observer: Observer<Value>) {
        this.observers.delete(observer)
    }

    notify(change: Change<Value>, transaction?: TransactionId) {
        if (transaction) {
            const accumulatedChange = this.transactions[transaction] || change
            accumulatedChange.value = change.value
            this.transactions[transaction] = accumulatedChange
        } else {
            this.callObservers(change)
        }
    }

    finishTransaction(transaction: TransactionId) {
        const accumulatedChange = this.transactions[transaction]
        delete this.transactions[transaction]
        return this.callObservers(accumulatedChange, transaction)
    }

    private callObservers(change: Change<Value>, transaction?: TransactionId) {
        const finishObservers: FinishFunction[] = []
        // Make a copy and de-duplicate so we always call all handlers,
        // even if the handler array changes because of handler call
        new Set(this.observers).forEach(observer => {
            if (typeof observer === "function") {
                observer(change, transaction)
            } else {
                observer.update(change, transaction)
                finishObservers.push(observer.finish)
            }
        })
        return finishObservers
    }
}
