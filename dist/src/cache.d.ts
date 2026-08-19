export interface CacheStore {
    get<T>(key: string): T | undefined | Promise<T | undefined>;
    set<T>(key: string, value: T, ttlMs?: number): void | Promise<void>;
    delete(key: string): boolean | Promise<boolean>;
    clear(): void | Promise<void>;
    readonly size?: number;
}
export declare class MemoryTtlCache implements CacheStore {
    private readonly store;
    private readonly defaultTtlMs;
    private readonly maxSize;
    constructor(options?: {
        defaultTtlMs?: number;
        maxSize?: number;
    });
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttlMs?: number): void;
    delete(key: string): boolean;
    clear(): void;
    get size(): number;
    private cleanExpired;
}
