export type LazyMap<T> = { [key: string]: () => T }

export function stripComponent(identifier: string) {
    const match = identifier.match(/(.*?\.[tj]sx?)_.*/)
    if (!match) return identifier
    return match[1]
}

export function warn(message: string, error?: any) {
    if (process.env.NODE_ENV === "test") return
    // tslint:disable-next-line:no-console
    console.log(
        "%c Loader: %c " + message,
        "color: white; font-weight: bold; background-color: #EE4444; border-radius: 5px; padding: 2px 5px",
        "color: #EE4444"
    )
    if (!error) return
    // tslint:disable-next-line:no-console
    console.warn(error)
}
