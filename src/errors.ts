/**
 * 노벨피아 SDK의 최상위 기본 에러 클래스
 */
export class NovelPiaError extends Error {
    /**
     * @param message 에러 메시지
     * @param cause 원인이 된 내부 에러 객체
     */
    constructor(message: string, public readonly cause?: unknown) {
        super(message)
        this.name = "NovelPiaError"
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

/**
 * 노벨피아 API 응답 실패 또는 HTTP 에러 발생 시 던져지는 에러 클래스
 */
export class NovelPiaApiError extends NovelPiaError {
    /**
     * @param message 에러 메시지
     * @param status HTTP 상태 코드 또는 응답 상태 코드
     * @param code API 에러 코드 문자열
     * @param errmsg API 응답 본문의 errmsg
     * @param rawResponse 원본 API 응답 데이터
     * @param cause 원인이 된 내부 에러 객체
     */
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

/**
 * 네트워크 연결 실패, DNS 조회 실패 등 네트워크 통신 장애 시 던져지는 에러 클래스
 */
export class NovelPiaNetworkError extends NovelPiaError {
    /**
     * @param message 에러 메시지
     * @param cause 원인이 된 내부 에러 객체
     */
    constructor(message: string, cause?: unknown) {
        super(message, cause)
        this.name = "NovelPiaNetworkError"
    }
}

/**
 * API 요청 시간이 설정된 타임아웃을 초과했을 때 던져지는 에러 클래스
 */
export class NovelPiaTimeoutError extends NovelPiaError {
    /**
     * @param message 에러 메시지
     * @param timeoutMs 타임아웃 제한 시간(밀리초)
     * @param cause 원인이 된 내부 에러 객체
     */
    constructor(
        message: string = "요청 시간이 초과되었습니다.",
        public readonly timeoutMs?: number,
        cause?: unknown,
    ) {
        super(message, cause)
        this.name = "NovelPiaTimeoutError"
    }
}

/**
 * API 요청 빈도 제한(HTTP 429 Too Many Requests)을 초과했을 때 던져지는 에러 클래스
 */
export class NovelPiaRateLimitError extends NovelPiaApiError {
    /**
     * @param message 에러 메시지
     * @param status HTTP 상태 코드 (기본값: 429)
     * @param retryAfter 재시도 대기 시간(초)
     * @param rawResponse 원본 응답 본문
     * @param cause 원인이 된 내부 에러 객체
     */
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

/**
 * 요청 파라미터 유효성 검증 실패 시 던져지는 에러 클래스
 */
export class NovelPiaValidationError extends NovelPiaError {
    /**
     * @param message 에러 메시지
     * @param invalidField 유효하지 않은 필드명
     * @param cause 원인이 된 내부 에러 객체
     */
    constructor(
        message: string,
        public readonly invalidField?: string,
        cause?: unknown,
    ) {
        super(message, cause)
        this.name = "NovelPiaValidationError"
    }
}
