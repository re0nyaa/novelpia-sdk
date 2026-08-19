export class NovelPiaError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message)
        this.name = "NovelPiaError"
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NovelPiaApiError extends NovelPiaError {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
        public readonly errmsg?: string,
        public readonly rawResponse?: unknown,
        cause?: unknown,
    ) {
        super(message, cause)
        this.name = "NovelPiaApiError"
    }
}

export class NovelPiaNetworkError extends NovelPiaError {
    constructor(message: string, cause?: unknown) {
        super(message, cause)
        this.name = "NovelPiaNetworkError"
    }
}

export class NovelPiaTimeoutError extends NovelPiaError {
    constructor(
        message: string = "요청 시간이 초과되었습니다.",
        public readonly timeoutMs?: number,
        cause?: unknown,
    ) {
        super(message, cause)
        this.name = "NovelPiaTimeoutError"
    }
}

export class NovelPiaRateLimitError extends NovelPiaApiError {
    constructor(
        message: string = "요청 빈도 제한(Rate Limit)을 초과했습니다.",
        status: number = 429,
        public readonly retryAfter?: number,
        rawResponse?: unknown,
        cause?: unknown,
    ) {
        super(message, status, "RATE_LIMIT_EXCEEDED", message, rawResponse, cause)
        this.name = "NovelPiaRateLimitError"
    }
}

export class NovelPiaValidationError extends NovelPiaError {
    constructor(
        message: string,
        public readonly invalidField?: string,
        cause?: unknown,
    ) {
        super(message, cause)
        this.name = "NovelPiaValidationError"
    }
}
