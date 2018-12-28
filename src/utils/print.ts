import { inspect } from "./inspect"

/**
 * Prints to the console.
 *
 * @param args - Arguments to print
 * @public
 */
export function print(...args: any[]) {
    const line = args
        .map(arg => {
            return inspect(arg)
        })
        .join(", ")

    // For now, output to console. Further work tracked under:
    // https://github.com/framer/company/issues/8142
    // tslint:disable-next-line:no-console
    console.log(line)
}
