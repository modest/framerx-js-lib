function manageCache(cache: Map<any, any>, maxEntries: number) {
    const size = cache.size
    if (size < maxEntries) return

    // randomly start at 0 or 1, delete every other key in a fast way
    let i = Math.round(Math.random())
    for (const key of cache.keys()) {
        if ((++i & 0x1) === 0x1) continue
        cache.delete(key)
    }
}

// cache a mapping of arguments to created values in an automatically managed cache
export function memoize<K, V>(maxEntries: number, cache: Map<K, V>, key: K, create: (key: K) => V) {
    const r = cache.get(key)
    if (r) return r

    manageCache(cache, maxEntries)
    const g = create(key)
    cache.set(key, g)
    return g
}
