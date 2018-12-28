/**
 * @internal
 */
export interface WithPackage {
    package: string
}

/**
 * @internal
 */
export function isWithPackage(target: any): target is WithPackage {
    return target && "package" in target
}
