import {
    NovelPiaApiError,
    NovelPiaNetworkError,
    NovelPiaRateLimitError,
    NovelPiaTimeoutError,
} from "./errors.js"

/**
 * 요청 재시도(Retry) 동작 설정 옵션
 */
export interface RetryOptions {
    /** 최대 재시도 횟수 (기본값: 3) */
    maxRetries?: number
    /** 기본 대기 시간(밀리초, 기본값: 500) */
    baseDelayMs?: number
    /** 최대 대기 시간(밀리초, 기본값: 10000) */
    maxDelayMs?: number
    /** 지터(랜덤 지연) 적용 여부 (기본값: true) */
    jitter?: boolean
    /**
     * 특정 에러 발생 시 재시도 여부를 결정하는 커스텀 판별 함수
     * @param error 발생한 에러 객체
     * @param attempt 현재 시도 횟수 (0부터 시작)
     * @returns 재시도 여부
     */
    shouldRetry?: (error: unknown, attempt: number) => boolean
}

/**
 * 지수 백오프(Exponential Backoff) 및 지터(Jitter) 기반의 재시도 대기 시간을 계산합니다.
 * @param attempt 현재 재시도 횟수 (0부터 시작)
 * @param baseDelayMs 기본 대기 시간(밀리초, 기본값: 500)
 * @param maxDelayMs 최대 대기 시간(밀리초, 기본값: 10000)
 * @param jitter 무작위 지연(지터) 적용 여부 (기본값: true)
 * @returns 계산된 대기 시간(밀리초)
 */
export function calculateBackoffDelay(
    attempt: number,
    baseDelayMs: number = 500,
    maxDelayMs: number = 10000,
    jitter: boolean = true,
): number {
    const exponentialDelay = Math.min(
        maxDelayMs,
        baseDelayMs * Math.pow(2, attempt),
    )

    if (!jitter) {
        return exponentialDelay
    }

    return Math.floor(Math.random() * exponentialDelay)
}

/**
 * 에러 객체가 일시적 장애로서 재시도 가능한 에러인지 판별합니다.
 * - 네트워크 오류(`NovelPiaNetworkError` 또는 관련 시스템 에러)
 * - 타임아웃 오류(`NovelPiaTimeoutError`)
 * - 요청 제한(`NovelPiaRateLimitError`, HTTP 429)
 * - 서버 오류(HTTP 5xx)
 * @param error 판별할 에러 객체
 * @returns 재시도 가능 여부
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof NovelPiaNetworkError) {
        return true
    }

    if (error instanceof NovelPiaTimeoutError) {
        return true
    }

    if (error instanceof NovelPiaRateLimitError) {
        return true
    }

    if (error instanceof NovelPiaApiError) {
        return error.status >= 500 || error.status === 429
    }

    if (error instanceof Error) {
        const msg = error.message.toLowerCase()
        if (
            msg.includes("econnreset") ||
            msg.includes("etimedout") ||
            msg.includes("econnrefused") ||
            msg.includes("fetch failed") ||
            msg.includes("network")
        ) {
            return true
        }
    }

    return false
}

/**
 * 주어진 비동기 작업을 재시도 정책에 따라 실행합니다.
 * @template T 작업의 반환 타입
 * @param operation 실행할 비동기 작업 함수 (현재 시도 횟수 주입)
 * @param options 재시도 옵션
 * @param onRetry 재시도 직전에 호출되는 콜백 함수
 * @returns 작업 완료 결과 프로미스
 * @throws 최대 재시도 횟수를 초과하거나 재시도 불가능한 에러인 경우 발생한 에러를 throw
 */
export async function withRetry<T>(
    operation: (attempt: number) => Promise<T>,
    options?: RetryOptions,
    onRetry?: (error: unknown, attempt: number, delayMs: number) => void,
): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3
    const baseDelayMs = options?.baseDelayMs ?? 500
    const maxDelayMs = options?.maxDelayMs ?? 10000
    const jitter = options?.jitter ?? true
    const shouldRetry = options?.shouldRetry ?? isRetryableError

    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation(attempt)
        } catch (error) {
            lastError = error

            if (attempt >= maxRetries || !shouldRetry(error, attempt)) {
                throw error
            }

            let delayMs = calculateBackoffDelay(
                attempt,
                baseDelayMs,
                maxDelayMs,
                jitter,
            )

            if (
                error instanceof NovelPiaRateLimitError &&
                error.retryAfter !== undefined
            ) {
                delayMs = Math.max(delayMs, error.retryAfter * 1000)
            }

            if (onRetry) {
                onRetry(error, attempt + 1, delayMs)
            }

            await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
    }

    throw lastError
}
