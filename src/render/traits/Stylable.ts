export interface WithStylable {
    _isStylable: boolean
}

const key: keyof WithStylable = "_isStylable"

export function withStylable(target: any): target is WithStylable {
    return key in target
}
