export const debounce = <T extends (...args: any[]) => void>(fn: T, time: number): T => {
    let timeout: NodeJS.Timer

    return function(): void {
        const functionCall = () => fn(...arguments)
        clearTimeout(timeout)
        timeout = setTimeout(functionCall, time)
    } as T
}
