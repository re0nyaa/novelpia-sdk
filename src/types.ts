export interface NovelSearch {
    novel_no: number
    novel_name: string
    novel_search: string
    novel_subtitle: string | null
    novel_age: number
    mem_no: number
    novel_thumb: string
    novel_img: string | null
    novel_thumb_all: string
    novel_img_all: string
    novel_count: number
    novel_status: number
    novel_type: number
    novel_genre: string
    novel_story: string
    novel_weekly: number
    count_view: number
    count_good: number
    count_book: number
    count_pick: number
    writer_nick: string
    writer_original: string
    isbn: string
    last_viewdate: string
    is_monopoly: number
    is_complete: number
    is_donation_refusal: number
    is_secondary_creation: number
    is_contest: number
    start_date: string
    status_date: string
    del_date: string | null
    complete_date: string | null
    last_write_date: string
    novel_live: number
    is_indent: number
    main_genre: number
    is_osmu: number | null
    flag_collect: number
    flag_img_policy: number
    flag_translate: number
    reg_date: string
    update_dt: string
    is_video: number
    cover_url: string
    writer_mem_no: number
    novel_genre_arr: string[]
    is_challenge: number
}

export interface NovelSearchResponse {
    status: number
    code: string
    errmsg: string
    list: NovelSearch[]
    total_cnt: number
    block_cnt: number
    block_adult_cnt: number
    block_not_live_cnt: number
}

export interface CurationNovel {
    novel_name: string
    novel_no: string
    writer_nick: string
    cover_url: string
    link_url: string
    novel_age: string
    novel_genre: string[]
    novel_story: string
    novel_words: string
    novel_thumb: string
    mem_nick: string
    novel_free: string
}

export interface CurationConfig {
    idx: number
    sub_title: string
    title: string
    bg_color: string
    flag_adult: number
    view_more_link: string
    sid: string
    flag_apply: number
    flag_icon_position: number
    icon_url: string
}

export interface CurationResponse {
    status: number
    errmsg: string
    list: CurationNovel[]
    conf: CurationConfig
}

export interface MillionNovel {
    novel_name: string
    novel_no: string
    writer_nick: string
    cover_url: string
    link_url: string
    novel_age: string
    novel_genre: string[]
    novel_story: string
    novel_words: string
    novel_thumb: string
    mem_nick: string
    novel_free: string
}

export interface Logger {
    debug(message: string, ...args: unknown[]): void
    info(message: string, ...args: unknown[]): void
    warn(message: string, ...args: unknown[]): void
    error(message: string, ...args: unknown[]): void
}

export interface RequestInterceptorContext {
    url: string
    params?: Record<string, unknown>
    headers: Record<string, string>
    attempt: number
    signal?: AbortSignal
}

export interface ResponseInterceptorContext<T = unknown> {
    url: string
    data: T
    status: number
    durationMs: number
    cached?: boolean
}

export interface ErrorInterceptorContext {
    url: string
    error: unknown
    attempt: number
}

export interface RetryInterceptorContext {
    url: string
    error: unknown
    attempt: number
    delayMs: number
}

export type RequestInterceptor = (
    context: RequestInterceptorContext,
) => void | RequestInterceptorContext | Promise<void | RequestInterceptorContext>

export type ResponseInterceptor<T = unknown> = (
    context: ResponseInterceptorContext<T>,
) => void | T | Promise<void | T>

export type ErrorInterceptor = (
    context: ErrorInterceptorContext,
) => void | Promise<void>

export type RetryInterceptor = (
    context: RetryInterceptorContext,
) => void | Promise<void>

export interface ClientInterceptors {
    onRequest?: RequestInterceptor | RequestInterceptor[]
    onResponse?: ResponseInterceptor | ResponseInterceptor[]
    onError?: ErrorInterceptor | ErrorInterceptor[]
    onRetry?: RetryInterceptor | RetryInterceptor[]
}

export interface NovelPiaClientOptions {
    baseUrl?: string
    timeout?: number
    maxRetries?: number
    retryBaseDelayMs?: number
    retryMaxDelayMs?: number
    headers?: Record<string, string>
    fetch?: typeof fetch
    cache?: boolean | import("./cache").CacheStore
    cacheTtlMs?: number
    logger?: Logger
    interceptors?: ClientInterceptors
}

export interface RequestOptions {
    timeout?: number
    signal?: AbortSignal
    maxRetries?: number
    skipCache?: boolean
    cacheTtlMs?: number
    headers?: Record<string, string>
}

export interface PaginationOptions {
    startPage?: number
    maxPages?: number
    pageDelayMs?: number
}


