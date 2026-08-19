export class MemoryTtlCache {
    store = new Map();
    defaultTtlMs;
    maxSize;
    constructor(options) {
        this.defaultTtlMs = options?.defaultTtlMs ?? 60 * 1000;
        this.maxSize = options?.maxSize ?? 500;
    }
    get(key) {
        const item = this.store.get(key);
        if (!item) {
            return undefined;
        }
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return item.value;
    }
    set(key, value, ttlMs) {
        this.cleanExpired();
        if (this.store.size >= this.maxSize && !this.store.has(key)) {
            const firstKey = this.store.keys().next().value;
            if (firstKey !== undefined) {
                this.store.delete(firstKey);
            }
        }
        const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
        const expiresAt = Date.now() + effectiveTtl;
        this.store.set(key, {
            value,
            expiresAt,
        });
    }
    delete(key) {
        return this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
    get size() {
        this.cleanExpired();
        return this.store.size;
    }
    cleanExpired() {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}
