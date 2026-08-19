import { NovelPiaApiError, NovelPiaNetworkError } from "../src/errors"
import {
    calculateBackoffDelay,
    isRetryableError,
    withRetry,
} from "../src/retry"

describe("Retry utilities", () => {
    describe("calculateBackoffDelay", () => {
        it("should calculate exponential delay without jitter", () => {
            const delay0 = calculateBackoffDelay(0, 100, 1000, false)
            const delay1 = calculateBackoffDelay(1, 100, 1000, false)
            const delay2 = calculateBackoffDelay(2, 100, 1000, false)

            expect(delay0).toBe(100)
            expect(delay1).toBe(200)
            expect(delay2).toBe(400)
        })

        it("should respect maxDelay", () => {
            const delay = calculateBackoffDelay(10, 100, 500, false)
            expect(delay).toBe(500)
        })

        it("should stay within bounds when jitter is true", () => {
            for (let i = 0; i < 20; i++) {
                const delay = calculateBackoffDelay(2, 100, 1000, true)
                expect(delay).toBeGreaterThanOrEqual(0)
                expect(delay).toBeLessThanOrEqual(400)
            }
        })
    })

    describe("isRetryableError", () => {
        it("should return true for network errors", () => {
            expect(isRetryableError(new NovelPiaNetworkError("Network down"))).toBe(true)
            expect(isRetryableError(new Error("fetch failed"))).toBe(true)
            expect(isRetryableError(new Error("ECONNRESET"))).toBe(true)
        })

        it("should return true for 5xx and 429 API errors", () => {
            expect(
                isRetryableError(new NovelPiaApiError("Server error", 500)),
            ).toBe(true)
            expect(
                isRetryableError(new NovelPiaApiError("Gateway timeout", 504)),
            ).toBe(true)
            expect(
                isRetryableError(new NovelPiaApiError("Too many requests", 429)),
            ).toBe(true)
        })

        it("should return false for 4xx (except 429) API errors", () => {
            expect(
                isRetryableError(new NovelPiaApiError("Bad request", 400)),
            ).toBe(false)
            expect(
                isRetryableError(new NovelPiaApiError("Not found", 404)),
            ).toBe(false)
        })
    })

    describe("withRetry", () => {
        it("should succeed on first try if no error", async () => {
            const mockOp = jest.fn().mockResolvedValue("success")
            const result = await withRetry(mockOp, { maxRetries: 3 })

            expect(result).toBe("success")
            expect(mockOp).toHaveBeenCalledTimes(1)
        })

        it("should retry on retryable error and succeed eventually", async () => {
            const mockOp = jest
                .fn()
                .mockRejectedValueOnce(new NovelPiaNetworkError("temporary failure"))
                .mockResolvedValueOnce("recovered")

            const onRetry = jest.fn()

            const result = await withRetry(
                mockOp,
                { maxRetries: 2, baseDelayMs: 10, maxDelayMs: 20 },
                onRetry,
            )

            expect(result).toBe("recovered")
            expect(mockOp).toHaveBeenCalledTimes(2)
            expect(onRetry).toHaveBeenCalledTimes(1)
        })

        it("should fail after exceeding maxRetries", async () => {
            const error = new NovelPiaNetworkError("persistent failure")
            const mockOp = jest.fn().mockRejectedValue(error)

            await expect(
                withRetry(mockOp, {
                    maxRetries: 2,
                    baseDelayMs: 10,
                    maxDelayMs: 20,
                }),
            ).rejects.toThrow("persistent failure")

            expect(mockOp).toHaveBeenCalledTimes(3) // attempt 0, 1, 2
        })
    })
})
