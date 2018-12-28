/**
 * @internal
 */
export function getURLs() {
    const params = new URL(window.location.href).searchParams
    const imageBaseURL = params.get("imageBaseURL") || ""
    const projectURL = params.get("projectURL") || ""
    return { imageBaseURL, projectURL }
}
