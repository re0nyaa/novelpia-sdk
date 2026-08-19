export interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
}
export declare function calculateBackoffDelay(attempt: number, baseDelayMs?: number, maxDelayMs?: number, jitter?: boolean): number;
export declare function isRetryableError(error: unknown): boolean;
export declare function withRetry<T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions, onRetry?: (error: unknown, attempt: number, delayMs: number) => void): Promise<T>;
