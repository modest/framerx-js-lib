/**
 * @alpha
 */
export function loadJSON<T>(url: string): Promise<T> {
    return fetch(url, { mode: "cors" }).then(res => res.json())
}
