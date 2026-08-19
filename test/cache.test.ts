import { MemoryTtlCache } from "../src/cache"

describe("MemoryTtlCache", () => {
    it("should store and retrieve items", () => {
        const cache = new MemoryTtlCache({ defaultTtlMs: 5000 })
        cache.set("key1", { data: "test" })

        expect(cache.get("key1")).toEqual({ data: "test" })
        expect(cache.size).toBe(1)
    })

    it("should return undefined for non-existent items", () => {
        const cache = new MemoryTtlCache()
        expect(cache.get("non-existent")).toBeUndefined()
    })

    it("should expire items after TTL", async () => {
        const cache = new MemoryTtlCache({ defaultTtlMs: 50 })
        cache.set("shortKey", "hello", 50)

        expect(cache.get("shortKey")).toBe("hello")

        await new Promise((resolve) => setTimeout(resolve, 60))

        expect(cache.get("shortKey")).toBeUndefined()
        expect(cache.size).toBe(0)
    })

    it("should delete items", () => {
        const cache = new MemoryTtlCache()
        cache.set("delKey", "value")
        expect(cache.delete("delKey")).toBe(true)
        expect(cache.get("delKey")).toBeUndefined()
        expect(cache.delete("delKey")).toBe(false)
    })

    it("should clear all items", () => {
        const cache = new MemoryTtlCache()
        cache.set("k1", 1)
        cache.set("k2", 2)
        expect(cache.size).toBe(2)

        cache.clear()
        expect(cache.size).toBe(0)
        expect(cache.get("k1")).toBeUndefined()
    })

    it("should evict oldest item when max capacity is reached", () => {
        const cache = new MemoryTtlCache({ maxSize: 2 })
        cache.set("a", 1)
        cache.set("b", 2)
        cache.set("c", 3)

        expect(cache.size).toBe(2)
        expect(cache.get("a")).toBeUndefined()
        expect(cache.get("b")).toBe(2)
        expect(cache.get("c")).toBe(3)
    })
})
