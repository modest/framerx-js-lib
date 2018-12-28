export function deprecationWarning(removedItem: string, removalVersion: string, replacement?: string) {
    const replacementText = replacement ? `, use ${replacement} instead` : ""
    const warningText = `Deprecation warning: ${removedItem} will be removed in version ${removalVersion}${replacementText}.`
    // tslint:disable-next-line:no-console
    console.warn(warningText)
}
