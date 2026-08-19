import { fetch as undiciFetch } from "undici"
import { MemoryTtlCache, type CacheStore } from "./cache"
import {
    NovelPiaApiError,
    NovelPiaError,
    NovelPiaNetworkError,
    NovelPiaRateLimitError,
    NovelPiaTimeoutError,
    NovelPiaValidationError,
} from "./errors"
import { withRetry } from "./retry"
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
} from "./types"

export interface SearchParams {
    page?: number
    rows?: number
    search_type?: string
    search_val?: string
    novel_type?: string
    novel_genre?: string
    sort_col?: "last_viewdate" | "count_view" | "count_good"
    is_complete?: 0 | 1
    is_challenge?: 0 | 1
}

export interface CurationParams {
    target: "million" | "pd-picks"
    rows?: number
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

    addRequestInterceptor(interceptor: RequestInterceptor): this {
        this.requestInterceptors.push(interceptor)
        return this
    }

    addResponseInterceptor(interceptor: ResponseInterceptor): this {
        this.responseInterceptors.push(interceptor)
        return this
    }

    addErrorInterceptor(interceptor: ErrorInterceptor): this {
        this.errorInterceptors.push(interceptor)
        return this
    }

    addRetryInterceptor(interceptor: RetryInterceptor): this {
        this.retryInterceptors.push(interceptor)
        return this
    }

    getCache(): CacheStore | undefined {
        return this.cacheStore
    }

    async clearCache(): Promise<void> {
        if (this.cacheStore) {
            await this.cacheStore.clear()
        }
    }

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

        return this.request<NovelSearchResponse>("/novel", queryParams, options)
    }

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

        return this.request<CurationResponse>(
            "/novel_curation",
            queryParams,
            options,
        )
    }

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

