import { NovelPiaApiError, NovelPiaNetworkError, NovelPiaRateLimitError, NovelPiaTimeoutError, } from "./errors";
export function calculateBackoffDelay(attempt, baseDelayMs = 500, maxDelayMs = 10000, jitter = true) {
    const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
    if (!jitter) {
        return exponentialDelay;
    }
    return Math.floor(Math.random() * exponentialDelay);
}
export function isRetryableError(error) {
    if (error instanceof NovelPiaNetworkError) {
        return true;
    }
    if (error instanceof NovelPiaTimeoutError) {
        return true;
    }
    if (error instanceof NovelPiaRateLimitError) {
        return true;
    }
    if (error instanceof NovelPiaApiError) {
        return error.status >= 500 || error.status === 429;
    }
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("econnreset") ||
            msg.includes("etimedout") ||
            msg.includes("econnrefused") ||
            msg.includes("fetch failed") ||
            msg.includes("network")) {
            return true;
        }
    }
    return false;
}
export async function withRetry(operation, options, onRetry) {
    const maxRetries = options?.maxRetries ?? 3;
    const baseDelayMs = options?.baseDelayMs ?? 500;
    const maxDelayMs = options?.maxDelayMs ?? 10000;
    const jitter = options?.jitter ?? true;
    const shouldRetry = options?.shouldRetry ?? isRetryableError;
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation(attempt);
        }
        catch (error) {
            lastError = error;
            if (attempt >= maxRetries || !shouldRetry(error, attempt)) {
                throw error;
            }
            let delayMs = calculateBackoffDelay(attempt, baseDelayMs, maxDelayMs, jitter);
            if (error instanceof NovelPiaRateLimitError &&
                error.retryAfter !== undefined) {
                delayMs = Math.max(delayMs, error.retryAfter * 1000);
            }
            if (onRetry) {
                onRetry(error, attempt + 1, delayMs);
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw lastError;
}
