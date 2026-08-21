/**
 * 노벨피아 SDK에서 사용하는 캐시 저장소 인터페이스
 */
export interface CacheStore {
    /**
     * 캐시에서 키에 해당하는 값을 조회합니다.
     * 만료되었거나 존재하지 않는 경우 undefined를 반환합니다.
     * @param key 캐시 키
     * @returns 저장된 값 또는 undefined
     */
    get<T>(key: string): T | undefined | Promise<T | undefined>

    /**
     * 캐시에 키-값 쌍을 저장합니다.
     * @param key 캐시 키
     * @param value 저장할 값
     * @param ttlMs 캐시 유효 시간(밀리초). 생략 시 기본 TTL 적용
     */
    set<T>(key: string, value: T, ttlMs?: number): void | Promise<void>

    /**
     * 캐시에서 특정 키를 삭제합니다.
     * @param key 삭제할 캐시 키
     * @returns 삭제 성공 여부
     */
    delete(key: string): boolean | Promise<boolean>

    /**
     * 캐시의 모든 데이터를 삭제합니다.
     */
    clear(): void | Promise<void>

    /**
     * 현재 캐시에 저장된 유효 항목의 개수
     */
    readonly size?: number
}

/**
 * 인메모리 캐시 아이템 구조
 */
interface CacheItem<T> {
    value: T
    expiresAt: number
}

/**
 * TTL(Time-To-Live) 기반의 인메모리 캐시 구현체 (FIFO/LRU 기반 최대 항목 수 제한 지원)
 */
export class MemoryTtlCache implements CacheStore {
    private readonly store = new Map<string, CacheItem<unknown>>()
    private readonly defaultTtlMs: number
    private readonly maxSize: number

    /**
     * @param options 캐시 설정 옵션
     * @param options.defaultTtlMs 기본 캐시 유효 시간(밀리초, 기본값: 60000ms / 1분)
     * @param options.maxSize 최대 보관 가능한 캐시 항목 수 (기본값: 500개)
     */
    constructor(options?: { defaultTtlMs?: number, maxSize?: number }) {
        this.defaultTtlMs = options?.defaultTtlMs ?? 60 * 1000
        this.maxSize = options?.maxSize ?? 500
    }

    /**
     * 캐시에서 키에 해당하는 값을 가져옵니다.
     * 만료된 항목은 자동으로 삭제되고 undefined가 반환됩니다.
     * @param key 캐시 키
     * @returns 캐시된 값 또는 undefined
     */
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

    /**
     * 캐시에 키와 값을 저장합니다.
     * 최대 항목 수를 초과할 경우 가장 오래된 항목부터 제거됩니다.
     * @param key 캐시 키
     * @param value 저장할 값
     * @param ttlMs 유효 시간(밀리초)
     */
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

    /**
     * 특정 키의 캐시를 삭제합니다.
     * @param key 삭제할 키
     * @returns 삭제 성공 여부
     */
    delete(key: string): boolean {
        return this.store.delete(key)
    }

    /**
     * 모든 캐시를 비웁니다.
     */
    clear(): void {
        this.store.clear()
    }

    /**
     * 현재 만료되지 않은 캐시 항목의 수를 반환합니다.
     */
    get size(): number {
        this.cleanExpired()
        return this.store.size
    }

    /**
     * 만료된 캐시 항목들을 정리합니다.
     */
    private cleanExpired(): void {
        const now = Date.now()
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key)
            }
        }
    }
}
