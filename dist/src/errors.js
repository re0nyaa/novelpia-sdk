export class NovelPiaError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "NovelPiaError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NovelPiaApiError extends NovelPiaError {
    status;
    code;
    errmsg;
    rawResponse;
    constructor(message, status, code, errmsg, rawResponse, cause) {
        super(message, cause);
        this.status = status;
        this.code = code;
        this.errmsg = errmsg;
        this.rawResponse = rawResponse;
        this.name = "NovelPiaApiError";
    }
}
export class NovelPiaNetworkError extends NovelPiaError {
    constructor(message, cause) {
        super(message, cause);
        this.name = "NovelPiaNetworkError";
    }
}
export class NovelPiaTimeoutError extends NovelPiaError {
    timeoutMs;
    constructor(message = "요청 시간이 초과되었습니다.", timeoutMs, cause) {
        super(message, cause);
        this.timeoutMs = timeoutMs;
        this.name = "NovelPiaTimeoutError";
    }
}
export class NovelPiaRateLimitError extends NovelPiaApiError {
    retryAfter;
    constructor(message = "요청 빈도 제한(Rate Limit)을 초과했습니다.", status = 429, retryAfter, rawResponse, cause) {
        super(message, status, "RATE_LIMIT_EXCEEDED", message, rawResponse, cause);
        this.retryAfter = retryAfter;
        this.name = "NovelPiaRateLimitError";
    }
}
export class NovelPiaValidationError extends NovelPiaError {
    invalidField;
    constructor(message, invalidField, cause) {
        super(message, cause);
        this.invalidField = invalidField;
        this.name = "NovelPiaValidationError";
    }
}
