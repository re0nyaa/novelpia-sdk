export declare class NovelPiaError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class NovelPiaApiError extends NovelPiaError {
    readonly status: number;
    readonly code?: string | undefined;
    readonly errmsg?: string | undefined;
    readonly rawResponse?: unknown | undefined;
    constructor(message: string, status: number, code?: string | undefined, errmsg?: string | undefined, rawResponse?: unknown | undefined, cause?: unknown);
}
export declare class NovelPiaNetworkError extends NovelPiaError {
    constructor(message: string, cause?: unknown);
}
export declare class NovelPiaTimeoutError extends NovelPiaError {
    readonly timeoutMs?: number | undefined;
    constructor(message?: string, timeoutMs?: number | undefined, cause?: unknown);
}
export declare class NovelPiaRateLimitError extends NovelPiaApiError {
    readonly retryAfter?: number | undefined;
    constructor(message?: string, status?: number, retryAfter?: number | undefined, rawResponse?: unknown, cause?: unknown);
}
export declare class NovelPiaValidationError extends NovelPiaError {
    readonly invalidField?: string | undefined;
    constructor(message: string, invalidField?: string | undefined, cause?: unknown);
}
