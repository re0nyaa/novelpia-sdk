import {
    NovelPiaApiError,
    NovelPiaError,
    NovelPiaNetworkError,
    NovelPiaRateLimitError,
    NovelPiaTimeoutError,
    NovelPiaValidationError,
} from "../src/errors"

describe("Enterprise Errors", () => {
    describe("NovelPiaError", () => {
        it("should create base error with message and cause", () => {
            const cause = new Error("Root cause")
            const error = new NovelPiaError("Base error message", cause)

            expect(error).toBeInstanceOf(Error)
            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error.name).toBe("NovelPiaError")
            expect(error.message).toBe("Base error message")
            expect(error.cause).toBe(cause)
        })
    })

    describe("NovelPiaApiError", () => {
        it("should capture HTTP status and API error fields", () => {
            const rawResponse = { status: 500, errmsg: "Server exploded" }
            const error = new NovelPiaApiError(
                "Internal Server Error",
                500,
                "ERR_500",
                "Server exploded",
                rawResponse,
            )

            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error).toBeInstanceOf(NovelPiaApiError)
            expect(error.name).toBe("NovelPiaApiError")
            expect(error.status).toBe(500)
            expect(error.code).toBe("ERR_500")
            expect(error.errmsg).toBe("Server exploded")
            expect(error.rawResponse).toBe(rawResponse)
        })
    })

    describe("NovelPiaNetworkError", () => {
        it("should capture network failures", () => {
            const error = new NovelPiaNetworkError("DNS lookup failed")

            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error).toBeInstanceOf(NovelPiaNetworkError)
            expect(error.name).toBe("NovelPiaNetworkError")
            expect(error.message).toBe("DNS lookup failed")
        })
    })

    describe("NovelPiaTimeoutError", () => {
        it("should capture timeout details", () => {
            const error = new NovelPiaTimeoutError("Request timed out", 5000)

            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error).toBeInstanceOf(NovelPiaTimeoutError)
            expect(error.name).toBe("NovelPiaTimeoutError")
            expect(error.timeoutMs).toBe(5000)
        })
    })

    describe("NovelPiaRateLimitError", () => {
        it("should handle 429 rate limit with retryAfter", () => {
            const error = new NovelPiaRateLimitError(
                "Rate limit exceeded",
                429,
                30,
            )

            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error).toBeInstanceOf(NovelPiaApiError)
            expect(error).toBeInstanceOf(NovelPiaRateLimitError)
            expect(error.name).toBe("NovelPiaRateLimitError")
            expect(error.status).toBe(429)
            expect(error.retryAfter).toBe(30)
        })
    })

    describe("NovelPiaValidationError", () => {
        it("should capture invalid field information", () => {
            const error = new NovelPiaValidationError(
                "Invalid target",
                "target",
            )

            expect(error).toBeInstanceOf(NovelPiaError)
            expect(error).toBeInstanceOf(NovelPiaValidationError)
            expect(error.name).toBe("NovelPiaValidationError")
            expect(error.invalidField).toBe("target")
        })
    })
})
