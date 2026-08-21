import { fetch as undiciFetch } from "undici"
import { MemoryTtlCache, type CacheStore } from "./cache.js"
import {
    NovelPiaApiError,
    NovelPiaError,
    NovelPiaNetworkError,
    NovelPiaRateLimitError,
    NovelPiaTimeoutError,
    NovelPiaValidationError,
} from "./errors.js"
import { withRetry } from "./retry.js"
import type {
    CurationResponse,
    ErrorInterceptor,
    Logger,
    NovelPiaClientOptions,
    NovelSearch,
    NovelSearchResponse,
    PaginationOptions,
    RequestInterceptor,
    RequestOptions,
    ResponseInterceptor,
    RetryInterceptor,
} from "./types.js"

/**
 * 소설 검색 요청 파라미터 인터페이스
 */
export interface SearchParams {
    /** 페이지 번호 (1부터 시작, 기본값: 1) */
    page?: number
    /** 페이지당 조회할 소설 개수 (기본값: 20) */
    rows?: number
    /** 검색 대상 유형 (기본값: 'all') */
    search_type?: string
    /** 검색 키워드 */
    search_val?: string
    /** 소설 구분 타입 */
    novel_type?: string
    /** 장르 필터 */
    novel_genre?: string
    /** 정렬 기준 컬럼 ('last_viewdate': 최신순, 'count_view': 조회순, 'count_good': 추천순) */
    sort_col?: "last_viewdate" | "count_view" | "count_good"
    /** 완결작 필터 (1: 완결작만, 0: 전체) */
    is_complete?: 0 | 1
    /** 챌린지 리그 필터 (1: 챌린지 작품만, 0: 전체) */
    is_challenge?: 0 | 1
}

/**
 * 큐레이션 조회 요청 파라미터 인터페이스
 */
export interface CurationParams {
    /** 큐레이션 대상 ('million': 밀리언 소설, 'pd-picks': PD 추천작) */
    target: "million" | "pd-picks"
    /** 조회할 소설 개수 (기본값: 100) */
    rows?: number
    /** 이전 밀리언 소설 플래그 여부 */
    prev_million_flag?: boolean
}

const CURATION_GROUP_MAP: Record<CurationParams["target"], number> = {
    million: 59,
    "pd-picks": 210,
}

const DEFAULT_BASE_URL = "https://novelpia.com/proc"
const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_BASE_DELAY_MS = 500
const DEFAULT_RETRY_MAX_DELAY_MS = 10000

/**
 * 소설 줄거리(novel_story) 문자열 내 \r\n, \r, \n 등의 개행 문자를 공백으로 치환하고 연속 공백을 정리합니다.
 * @param story 원본 줄거리 문자열
 * @returns 정제된 줄거리 문자열
 */
function cleanNovelStory(story?: string): string {
    if (!story) {
        return ""
    }
    return story
        .replace(/\r\n|\r|\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

/**
 * 노벨피아(Novelpia) API 클라이언트
 *
 * @example
 * ```typescript
 * import { NovelPiaClient } from "novelpia-sdk"
 *
 * const client = new NovelPiaClient()
 * const result = await client.search({ search_val: "판타지", rows: 10 })
 * console.log(result.list)
 * ```
 */
export class NovelPiaClient {
    private readonly baseUrl: string
    private readonly timeoutMs: number
    private readonly maxRetries: number
    private readonly retryBaseDelayMs: number
    private readonly retryMaxDelayMs: number
    private readonly defaultHeaders: Record<string, string>
    private readonly customFetch: typeof fetch
    private readonly cacheStore?: CacheStore
    private readonly cacheTtlMs: number
    private readonly logger?: Logger

    private readonly requestInterceptors: RequestInterceptor[] = []
    private readonly responseInterceptors: ResponseInterceptor[] = []
    private readonly errorInterceptors: ErrorInterceptor[] = []
    private readonly retryInterceptors: RetryInterceptor[] = []

    /**
     * NovelPiaClient 인스턴스를 생성합니다.
     * @param baseUrlOrOptions 기본 URL 문자열 또는 클라이언트 설정 옵션 객체
     */
    constructor(baseUrlOrOptions?: string | NovelPiaClientOptions) {
        if (typeof baseUrlOrOptions === "string") {
            this.baseUrl = baseUrlOrOptions
            this.timeoutMs = DEFAULT_TIMEOUT_MS
            this.maxRetries = DEFAULT_MAX_RETRIES
            this.retryBaseDelayMs = DEFAULT_RETRY_BASE_DELAY_MS
            this.retryMaxDelayMs = DEFAULT_RETRY_MAX_DELAY_MS
            this.defaultHeaders = {}
            this.customFetch = undiciFetch as unknown as typeof fetch
            this.cacheTtlMs = 60000
        } else {
            const options = baseUrlOrOptions ?? {}
            this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
            this.timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS
            this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
            this.retryBaseDelayMs =
                options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS
            this.retryMaxDelayMs =
                options.retryMaxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS
            this.defaultHeaders = { ...options.headers }
            this.customFetch = (options.fetch ??
                undiciFetch) as unknown as typeof fetch
            this.cacheTtlMs = options.cacheTtlMs ?? 60000
            this.logger = options.logger

            if (options.cache === true) {
                this.cacheStore = new MemoryTtlCache({
                    defaultTtlMs: this.cacheTtlMs,
                })
            } else if (typeof options.cache === "object") {
                this.cacheStore = options.cache
            }

            if (options.interceptors) {
                if (options.interceptors.onRequest) {
                    const req = options.interceptors.onRequest
                    if (Array.isArray(req)) {
                        this.requestInterceptors.push(...req)
                    } else {
                        this.requestInterceptors.push(req)
                    }
                }
                if (options.interceptors.onResponse) {
                    const res = options.interceptors.onResponse
                    if (Array.isArray(res)) {
                        this.responseInterceptors.push(...res)
                    } else {
                        this.responseInterceptors.push(res)
                    }
                }
                if (options.interceptors.onError) {
                    const err = options.interceptors.onError
                    if (Array.isArray(err)) {
                        this.errorInterceptors.push(...err)
                    } else {
                        this.errorInterceptors.push(err)
                    }
                }
                if (options.interceptors.onRetry) {
                    const ret = options.interceptors.onRetry
                    if (Array.isArray(ret)) {
                        this.retryInterceptors.push(...ret)
                    } else {
                        this.retryInterceptors.push(ret)
                    }
                }
            }
        }
    }

    /**
     * 요청 직전에 실행될 인터셉터를 등록합니다.
     * @param interceptor 요청 인터셉터 함수
     * @returns 클라이언트 인스턴스 (메서드 체이닝 가능)
     */
    addRequestInterceptor(interceptor: RequestInterceptor): this {
        this.requestInterceptors.push(interceptor)
        return this
    }

    /**
     * 응답 수신 직후에 실행될 인터셉터를 등록합니다.
     * @param interceptor 응답 인터셉터 함수
     * @returns 클라이언트 인스턴스 (메서드 체이닝 가능)
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): this {
        this.responseInterceptors.push(interceptor)
        return this
    }

    /**
     * 요청 중 에러 발생 시 실행될 인터셉터를 등록합니다.
     * @param interceptor 에러 인터셉터 함수
     * @returns 클라이언트 인스턴스 (메서드 체이닝 가능)
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): this {
        this.errorInterceptors.push(interceptor)
        return this
    }

    /**
     * 요청 재시도 직전에 실행될 인터셉터를 등록합니다.
     * @param interceptor 재시도 인터셉터 함수
     * @returns 클라이언트 인스턴스 (메서드 체이닝 가능)
     */
    addRetryInterceptor(interceptor: RetryInterceptor): this {
        this.retryInterceptors.push(interceptor)
        return this
    }

    /**
     * 현재 설정된 캐시 저장소 인스턴스를 반환합니다.
     * @returns 캐시 스토어 또는 undefined
     */
    getCache(): CacheStore | undefined {
        return this.cacheStore
    }

    /**
     * 저장된 모든 캐시 데이터를 삭제합니다.
     */
    async clearCache(): Promise<void> {
        if (this.cacheStore) {
            await this.cacheStore.clear()
        }
    }

    /**
     * 노벨피아 소설 목록을 검색합니다.
     *
     * @param params 검색 조건 파라미터
     * @param options 개별 요청 옵션
     * @returns 소설 검색 결과 응답 객체
     * @throws {NovelPiaApiError} API 오류 응답 또는 응답 파싱 실패 시
     * @throws {NovelPiaNetworkError} 네트워크 연결 실패 시
     * @throws {NovelPiaTimeoutError} 요청 타임아웃 초과 시
     * @throws {NovelPiaRateLimitError} 요청 빈도 제한 초과 시
     *
     * @example
     * ```typescript
     * const results = await client.search({
     *     search_val: "이세계",
     *     page: 1,
     *     rows: 20,
     *     sort_col: "count_view"
     * })
     * ```
     */
    async search(
        params: SearchParams,
        options?: RequestOptions,
    ): Promise<NovelSearchResponse> {
        const queryParams: Record<string, string> = {
            cmd: "novel_search",
            page: String(params.page ?? 1),
            rows: String(params.rows ?? 20),
            search_type: params.search_type ?? "all",
            search_val: params.search_val ?? "",
            novel_type: params.novel_type ?? "",
            novel_genre: params.novel_genre ?? "",
            sort_col: params.sort_col ?? "last_viewdate",
            is_complete: params.is_complete ? "1" : "",
            is_challenge: params.is_challenge ? "1" : "",
            block_out: "0",
            block_stop: "0",
            is_contest: "0",
            list_display: "list",
            _: Date.now().toString(),
        }

        const response = await this.request<NovelSearchResponse>(
            "/novel",
            queryParams,
            options,
        )

        if (Array.isArray(response?.list)) {
            for (const novel of response.list) {
                if (typeof novel.novel_story === "string") {
                    novel.novel_story = cleanNovelStory(novel.novel_story)
                }
            }
        }

        return response
    }

    /**
     * 노벨피아 큐레이션(밀리언 소설, PD 추천작 등) 목록을 조회합니다.
     *
     * @param params 큐레이션 대상 조건
     * @param options 개별 요청 옵션
     * @returns 큐레이션 응답 객체
     * @throws {NovelPiaValidationError} 유효하지 않은 큐레이션 타겟 지정 시
     * @throws {NovelPiaApiError} API 오류 응답 시
     *
     * @example
     * ```typescript
     * const curation = await client.getCuration({ target: "pd-picks" })
     * console.log(curation.list)
     * ```
     */
    async getCuration(
        params: CurationParams,
        options?: RequestOptions,
    ): Promise<CurationResponse> {
        const mainGroup = CURATION_GROUP_MAP[params.target]
        if (!mainGroup) {
            throw new NovelPiaValidationError(
                `유효하지 않은 큐레이션 타겟입니다: ${params.target}`,
                "target",
            )
        }

        const queryParams: Record<string, string> = {
            cmd: "million_novel_curation",
            main_group: String(mainGroup),
            rows: String(params.rows ?? 100),
            _: Date.now().toString(),
        }

        if (params.prev_million_flag) {
            queryParams.prev_million_flag = "true"
        }

        const response = await this.request<CurationResponse>(
            "/novel_curation",
            queryParams,
            options,
        )

        if (Array.isArray(response?.list)) {
            for (const novel of response.list) {
                if (typeof novel.novel_story === "string") {
                    novel.novel_story = cleanNovelStory(novel.novel_story)
                }
            }
        }

        return response
    }

    /**
     * 검색 결과를 페이지 단위로 순회할 수 있는 비동기 제너레이터를 반환합니다.
     *
     * @param params 검색 조건 파라미터
     * @param options 요청 및 페이지네이션 제어 옵션
     * @yields 페이지별 NovelSearchResponse 응답 객체
     *
     * @example
     * ```typescript
     * for await (const pageResponse of client.paginateSearch({ search_val: "판타지" }, { maxPages: 3 })) {
     *     console.log(`페이지 결과 수: ${pageResponse.list.length}`)
     * }
     * ```
     */
    async *paginateSearch(
        params: SearchParams,
        options?: RequestOptions & PaginationOptions,
    ): AsyncIterableIterator<NovelSearchResponse> {
        let currentPage = options?.startPage ?? params.page ?? 1
        let fetchedPages = 0
        const maxPages = options?.maxPages ?? Infinity
        const pageDelayMs = options?.pageDelayMs ?? 0

        while (fetchedPages < maxPages) {
            const response = await this.search(
                {
                    ...params,
                    page: currentPage,
                },
                options,
            )

            yield response
            fetchedPages++

            if (
                !response.list ||
                response.list.length === 0 ||
                currentPage * (params.rows ?? 20) >= response.total_cnt
            ) {
                break
            }

            currentPage++

            if (pageDelayMs > 0 && fetchedPages < maxPages) {
                await new Promise((resolve) => setTimeout(resolve, pageDelayMs))
            }
        }
    }

    /**
     * 검색된 모든 소설 항목을 1개씩 순차적으로 순회할 수 있는 비동기 제너레이터를 반환합니다.
     *
     * @param params 검색 조건 파라미터
     * @param options 요청 및 페이지네이션 제어 옵션
     * @yields 개별 NovelSearch 소설 객체
     *
     * @example
     * ```typescript
     * for await (const novel of client.iterateSearch({ search_val: "게임" }, { maxPages: 2 })) {
     *     console.log(`소설: ${novel.novel_name} (작가: ${novel.writer_nick})`)
     * }
     * ```
     */
    async *iterateSearch(
        params: SearchParams,
        options?: RequestOptions & PaginationOptions,
    ): AsyncIterableIterator<NovelSearch> {
        for await (const pageResponse of this.paginateSearch(params, options)) {
            for (const novel of pageResponse.list) {
                yield novel
            }
        }
    }

    /**
     * 내부 HTTP GET 요청 처리 메서드 (캐시 확인, 인터셉터, 재시도, 에러 래핑 포함)
     * @template T 응답 데이터 타입
     * @param path API 경로
     * @param params 쿼리 파라미터 맵
     * @param options 요청 옵션
     * @returns 응답 데이터 프로미스
     */
    private async request<T>(
        path: string,
        params: Record<string, string>,
        options?: RequestOptions,
    ): Promise<T> {
        const searchParams = new URLSearchParams(params)
        const requestUrl = `${this.baseUrl}${path}?${searchParams.toString()}`

        const cacheSearchParams = new URLSearchParams(params)
        cacheSearchParams.delete("_")
        const cacheKey = `${this.baseUrl}${path}?${cacheSearchParams.toString()}`

        const skipCache = options?.skipCache ?? false
        const ttlMs = options?.cacheTtlMs ?? this.cacheTtlMs

        if (!skipCache && this.cacheStore) {
            const cached = await this.cacheStore.get<T>(cacheKey)
            if (cached !== undefined) {
                this.logger?.debug?.(`[Novelpia] Cache Hit: ${cacheKey}`)
                let finalData: Awaited<T> = cached
                for (const interceptor of this.responseInterceptors) {
                    const result = await interceptor({
                        url: requestUrl,
                        data: finalData,
                        status: 200,
                        durationMs: 0,
                        cached: true,
                    })
                    if (result !== undefined) {
                        finalData = result as unknown as Awaited<T>
                    }
                }
                return finalData as T
            }
        }

        const maxRetries = options?.maxRetries ?? this.maxRetries
        const timeoutMs = options?.timeout ?? this.timeoutMs

        return withRetry(
            async (attempt) => {
                const startTime = Date.now()
                let reqHeaders: Record<string, string> = {
                    ...this.defaultHeaders,
                    ...options?.headers,
                }

                let interceptorContext: import("./types").RequestInterceptorContext =
                    {
                        url: requestUrl,
                        params,
                        headers: reqHeaders,
                        attempt,
                        signal: options?.signal,
                    }

                for (const interceptor of this.requestInterceptors) {
                    const modified = await interceptor(interceptorContext)
                    if (modified) {
                        interceptorContext = modified
                    }
                }

                reqHeaders = interceptorContext.headers

                const controller = new AbortController()
                let timeoutId: ReturnType<typeof setTimeout> | undefined

                if (timeoutMs > 0) {
                    timeoutId = setTimeout(() => {
                        controller.abort(
                            new NovelPiaTimeoutError(
                                `요청 타임아웃 (${timeoutMs}ms 초과): ${requestUrl}`,
                                timeoutMs,
                            ),
                        )
                    }, timeoutMs)
                }

                if (options?.signal) {
                    options.signal.addEventListener("abort", () => {
                        controller.abort(options.signal?.reason)
                    })
                }

                try {
                    this.logger?.debug?.(
                        `[Novelpia] Requesting (시도 ${attempt + 1}): ${requestUrl}`,
                    )

                    const response = await this.customFetch(requestUrl, {
                        method: "GET",
                        headers: reqHeaders,
                        signal: controller.signal,
                    })

                    const durationMs = Date.now() - startTime

                    if (response.status === 429) {
                        const retryAfterHeader =
                            response.headers.get("Retry-After")
                        const retryAfter = retryAfterHeader
                            ? parseInt(retryAfterHeader, 10)
                            : undefined
                        throw new NovelPiaRateLimitError(
                            "Novelpia API 요청 빈도 제한(Rate Limit)을 초과했습니다.",
                            429,
                            retryAfter,
                        )
                    }

                    if (!response.ok) {
                        throw new NovelPiaApiError(
                            `Failed to fetch: ${response.statusText}`,
                            response.status,
                        )
                    }

                    let rawData: unknown
                    try {
                        rawData = await response.json()
                    } catch (jsonErr) {
                        throw new NovelPiaApiError(
                            `응답 JSON 파싱 실패: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`,
                            response.status,
                            undefined,
                            undefined,
                            undefined,
                            jsonErr,
                        )
                    }

                    const resObj = rawData as {
                        status?: number
                        code?: string
                        errmsg?: string
                    }

                    if (
                        resObj &&
                        typeof resObj.status === "number" &&
                        resObj.status !== 200 &&
                        resObj.errmsg
                    ) {
                        throw new NovelPiaApiError(
                            resObj.errmsg || "API 오류 응답을 수신했습니다.",
                            resObj.status,
                            resObj.code,
                            resObj.errmsg,
                            rawData,
                        )
                    }

                    let finalData = rawData as T

                    for (const interceptor of this.responseInterceptors) {
                        const modified = await interceptor({
                            url: requestUrl,
                            data: finalData,
                            status: response.status,
                            durationMs,
                            cached: false,
                        })
                        if (modified !== undefined) {
                            finalData = modified as unknown as T
                        }
                    }

                    if (!skipCache && this.cacheStore) {
                        await this.cacheStore.set(cacheKey, finalData, ttlMs)
                    }

                    return finalData
                } catch (error) {
                    let handledError = error
                    if (
                        controller.signal.aborted &&
                        controller.signal.reason instanceof NovelPiaTimeoutError
                    ) {
                        handledError = controller.signal.reason
                    } else if (
                        error instanceof Error &&
                        (error.name === "AbortError" ||
                            error.name === "TimeoutError")
                    ) {
                        handledError = new NovelPiaTimeoutError(
                            `요청 타임아웃 (${timeoutMs}ms 초과): ${requestUrl}`,
                            timeoutMs,
                            error,
                        )
                    } else if (!(error instanceof NovelPiaError)) {
                        handledError = new NovelPiaNetworkError(
                            `네트워크 통신 오류: ${error instanceof Error ? error.message : String(error)}`,
                            error,
                        )
                    }

                    for (const interceptor of this.errorInterceptors) {
                        await interceptor({
                            url: requestUrl,
                            error: handledError,
                            attempt,
                        })
                    }

                    this.logger?.error?.(
                        `[Novelpia] Request Error: ${handledError instanceof Error ? handledError.message : String(handledError)}`,
                    )

                    throw handledError
                } finally {
                    if (timeoutId) {
                        clearTimeout(timeoutId)
                    }
                }
            },
            {
                maxRetries,
                baseDelayMs: this.retryBaseDelayMs,
                maxDelayMs: this.retryMaxDelayMs,
            },
            async (retryError, nextAttempt, delayMs) => {
                for (const interceptor of this.retryInterceptors) {
                    await interceptor({
                        url: requestUrl,
                        error: retryError,
                        attempt: nextAttempt,
                        delayMs,
                    })
                }
                this.logger?.warn?.(
                    `[Novelpia] Retrying ${requestUrl} (다음 시도: ${nextAttempt}, 대기: ${delayMs}ms)`,
                )
            },
        )
    }
}

export default NovelPiaClient
