export interface CacheStore {
    get<T>(key: string): T | undefined | Promise<T | undefined>
    set<T>(key: string, value: T, ttlMs?: number): void | Promise<void>
    delete(key: string): boolean | Promise<boolean>
    clear(): void | Promise<void>
    readonly size?: number
}

interface CacheItem<T> {
    value: T
    expiresAt: number
}

export class MemoryTtlCache implements CacheStore {
    private readonly store = new Map<string, CacheItem<unknown>>()
    private readonly defaultTtlMs: number
    private readonly maxSize: number

    constructor(options?: { defaultTtlMs?: number, maxSize?: number }) {
        this.defaultTtlMs = options?.defaultTtlMs ?? 60 * 1000
        this.maxSize = options?.maxSize ?? 500
    }

    get<T>(key: string): T | undefined {
        const item = this.store.get(key)
        if (!item) {
            return undefined
        }

        if (Date.now() > item.expiresAt) {
            this.store.delete(key)
            return undefined
        }

        return item.value as T
    }

    set<T>(key: string, value: T, ttlMs?: number): void {
        this.cleanExpired()

        if (this.store.size >= this.maxSize && !this.store.has(key)) {
            const firstKey = this.store.keys().next().value
            if (firstKey !== undefined) {
                this.store.delete(firstKey)
            }
        }

        const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs
        const expiresAt = Date.now() + effectiveTtl

        this.store.set(key, {
            value,
            expiresAt,
        })
    }

    delete(key: string): boolean {
        return this.store.delete(key)
    }

    clear(): void {
        this.store.clear()
    }

    get size(): number {
        this.cleanExpired()
        return this.store.size
    }

    private cleanExpired(): void {
        const now = Date.now()
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key)
            }
        }
    }
}
