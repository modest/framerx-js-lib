/**
 * @public
 */
interface Size {
    width: number
    height: number
}

/**
 * @public
 */
function Size(width: number, height: number): Size {
    return { width, height }
}

/**
 * @public
 */
namespace Size {
    /**
     * @param sizeA
     * @param sizeB
     * @alpha
     */
    export const equals = (sizeA: Size | null, sizeB: Size | null) => {
        if (sizeA === sizeB) return true
        if (!sizeA || !sizeB) return false
        return sizeA.width === sizeB.width && sizeA.height === sizeB.height
    }

    /**
     *
     * @param fromSize The initial size
     * @param toSize The size to update to
     * @param keepAspectRatio If the updating should preserve the aspect ratio
     * @remark
     * keepAspectRatio only works if passing a toSize with only a width or height
     * @alpha
     */
    export const update = (fromSize: Size, toSize: Partial<Size>, keepAspectRatio = false) => {
        let { width, height } = fromSize
        const sizeRatio = width / height

        // Update from partial
        width = toSize.width !== undefined ? toSize.width : width
        height = toSize.height !== undefined ? toSize.height : height

        // Overwrite if we want and can keep the aspect ratio
        if (keepAspectRatio) {
            if (toSize.width === undefined && toSize.height !== undefined) {
                width = toSize.height * sizeRatio
            }
            if (toSize.width !== undefined && toSize.height === undefined && sizeRatio !== 0) {
                height = toSize.width / sizeRatio
            }
        }

        return { width, height }
    }

    /**
     *
     * @param sizeA
     * @param sizeB
     * @alpha
     */
    export function subtract(sizeA: Size, sizeB: Size) {
        return {
            width: Math.max(0, sizeA.width - sizeB.width),
            height: Math.max(0, sizeA.height - sizeB.height),
        }
    }

    /**
     * @public
     */
    export const zero = Size(0, 0)

    /**
     * Checks if the size has a zero width and zero height
     * @param size size to check
     * @public
     */
    export const isZero = function(size: Size) {
        return size === Size.zero || (size.width === 0 && size.height === 0)
    }

    /**
     * @param width
     * @param height
     * @param size
     * @alpha
     */
    export const defaultIfZero = function(width: number, height: number, size: Size) {
        if (isZero(size)) {
            return Size(width, height)
        } // else
        return size
    }
}

export { Size }
