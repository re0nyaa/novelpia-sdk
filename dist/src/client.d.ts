import { type CacheStore } from "./cache";
import type { CurationResponse, ErrorInterceptor, NovelPiaClientOptions, NovelSearch, NovelSearchResponse, PaginationOptions, RequestInterceptor, RequestOptions, ResponseInterceptor, RetryInterceptor } from "./types";
export interface SearchParams {
    page?: number;
    rows?: number;
    search_type?: string;
    search_val?: string;
    novel_type?: string;
    novel_genre?: string;
    sort_col?: "last_viewdate" | "count_view" | "count_good";
    is_complete?: 0 | 1;
    is_challenge?: 0 | 1;
}
export interface CurationParams {
    target: "million" | "pd-picks";
    rows?: number;
    prev_million_flag?: boolean;
}
export declare class NovelPiaClient {
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly maxRetries;
    private readonly retryBaseDelayMs;
    private readonly retryMaxDelayMs;
    private readonly defaultHeaders;
    private readonly customFetch;
    private readonly cacheStore?;
    private readonly cacheTtlMs;
    private readonly logger?;
    private readonly requestInterceptors;
    private readonly responseInterceptors;
    private readonly errorInterceptors;
    private readonly retryInterceptors;
    constructor(baseUrlOrOptions?: string | NovelPiaClientOptions);
    addRequestInterceptor(interceptor: RequestInterceptor): this;
    addResponseInterceptor(interceptor: ResponseInterceptor): this;
    addErrorInterceptor(interceptor: ErrorInterceptor): this;
    addRetryInterceptor(interceptor: RetryInterceptor): this;
    getCache(): CacheStore | undefined;
    clearCache(): Promise<void>;
    search(params: SearchParams, options?: RequestOptions): Promise<NovelSearchResponse>;
    getCuration(params: CurationParams, options?: RequestOptions): Promise<CurationResponse>;
    paginateSearch(params: SearchParams, options?: RequestOptions & PaginationOptions): AsyncIterableIterator<NovelSearchResponse>;
    iterateSearch(params: SearchParams, options?: RequestOptions & PaginationOptions): AsyncIterableIterator<NovelSearch>;
    private request;
}
export default NovelPiaClient;
