import {
    NovelPiaClient,
    type SearchParams,
    type CurationParams,
} from "../src/client"
import {
    NovelPiaApiError,
    NovelPiaRateLimitError,
    NovelPiaTimeoutError,
    NovelPiaValidationError,
} from "../src/errors"
import type { NovelSearchResponse, CurationResponse } from "../src/types"

// Mock fetch from undici
jest.mock("undici", () => ({
    fetch: jest.fn(),
}))

import { fetch } from "undici"

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe("NovelPiaClient", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("constructor", () => {
        it("should use default BASE_URL when not provided", () => {
            const client = new NovelPiaClient()
            expect(client).toBeInstanceOf(NovelPiaClient)
        })

        it("should use custom baseUrl string when provided", () => {
            const customUrl = "https://novelpia.com/proc"
            const client = new NovelPiaClient(customUrl)
            expect(client).toBeInstanceOf(NovelPiaClient)
        })

        it("should support client options object with cache, logger, interceptors", () => {
            const mockLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }
            const onRequest = jest.fn()

            const client = new NovelPiaClient({
                baseUrl: "https://api.example.com",
                timeout: 5000,
                maxRetries: 2,
                cache: true,
                logger: mockLogger,
                interceptors: {
                    onRequest,
                },
            })

            expect(client).toBeInstanceOf(NovelPiaClient)
            expect(client.getCache()).toBeDefined()
        })
    })

    describe("search method", () => {
        it("should fetch with correct URL and default params", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 0,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const result = await client.search({ search_val: "테스트" })

            expect(result.status).toBe(200)
            expect(mockFetch).toHaveBeenCalledTimes(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("cmd=novel_search")
            expect(callUrl).toContain("search_val=")
        })

        it("should handle search with custom parameters", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [
                    {
                        novel_no: 1,
                        novel_name: "테스트 소설",
                        novel_search: "",
                        novel_subtitle: null,
                        novel_age: 0,
                        mem_no: 1,
                        novel_thumb: "",
                        novel_img: null,
                        novel_thumb_all: "",
                        novel_img_all: "",
                        novel_count: 0,
                        novel_status: 1,
                        novel_type: 1,
                        novel_genre: "[]",
                        novel_story: "",
                        novel_weekly: 0,
                        count_view: 100,
                        count_good: 50,
                        count_book: 10,
                        count_pick: 1,
                        writer_nick: "작가",
                        writer_original: "",
                        isbn: "",
                        last_viewdate: "2026-04-07",
                        is_monopoly: 0,
                        is_complete: 0,
                        is_donation_refusal: 0,
                        is_secondary_creation: 0,
                        is_contest: 0,
                        start_date: "2026-04-01",
                        status_date: "2026-04-07",
                        del_date: null,
                        complete_date: null,
                        last_write_date: "2026-04-07",
                        novel_live: 1,
                        is_indent: 0,
                        main_genre: 1,
                        is_osmu: null,
                        flag_collect: 0,
                        flag_img_policy: 0,
                        flag_translate: 0,
                        reg_date: "2026-04-01",
                        update_dt: "2026-04-07",
                        is_video: 0,
                        cover_url: "",
                        writer_mem_no: 1,
                        novel_genre_arr: [],
                        is_challenge: 0,
                    },
                ],
                total_cnt: 1,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const params: SearchParams = {
                page: 2,
                rows: 50,
                search_val: "판타지",
                sort_col: "count_view",
                is_complete: 1,
            }

            const result = await client.search(params)

            expect(result.list).toHaveLength(1)
            expect(result.list[0].novel_name).toBe("테스트 소설")
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("page=2")
            expect(callUrl).toContain("rows=50")
        })

        it("should clean \\r\\n in novel_story for search results", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [
                    {
                        novel_no: 1,
                        novel_name: "테스트 소설",
                        novel_search: "",
                        novel_subtitle: null,
                        novel_age: 0,
                        mem_no: 1,
                        novel_thumb: "",
                        novel_img: null,
                        novel_thumb_all: "",
                        novel_img_all: "",
                        novel_count: 0,
                        novel_status: 1,
                        novel_type: 1,
                        novel_genre: "[]",
                        novel_story:
                            "첫 번째 줄\r\n두 번째 줄\r\n\r\n세 번째 줄",
                        novel_weekly: 0,
                        count_view: 100,
                        count_good: 50,
                        count_book: 10,
                        count_pick: 1,
                        writer_nick: "작가",
                        writer_original: "",
                        isbn: "",
                        last_viewdate: "2026-04-07",
                        is_monopoly: 0,
                        is_complete: 0,
                        is_donation_refusal: 0,
                        is_secondary_creation: 0,
                        is_contest: 0,
                        start_date: "2026-04-01",
                        status_date: "2026-04-07",
                        del_date: null,
                        complete_date: null,
                        last_write_date: "2026-04-07",
                        novel_live: 1,
                        is_indent: 0,
                        main_genre: 1,
                        is_osmu: null,
                        flag_collect: 0,
                        flag_img_policy: 0,
                        flag_translate: 0,
                        reg_date: "2026-04-01",
                        update_dt: "2026-04-07",
                        is_video: 0,
                        cover_url: "",
                        writer_mem_no: 1,
                        novel_genre_arr: [],
                        is_challenge: 0,
                    },
                ],
                total_cnt: 1,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const result = await client.search({ search_val: "테스트" })

            expect(result.list[0].novel_story).toBe(
                "첫 번째 줄 두 번째 줄 세 번째 줄",
            )
        })

        it("should throw NovelPiaApiError when response is not ok", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
            } as any)

            const client = new NovelPiaClient({ maxRetries: 0 })

            await expect(
                client.search({ search_val: "테스트" }),
            ).rejects.toThrow(NovelPiaApiError)
        })

        it("should throw NovelPiaApiError when API returns error status in body", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    status: 500,
                    code: "INTERNAL_ERROR",
                    errmsg: "서버 내부 처리 오류",
                }),
            } as any)

            const client = new NovelPiaClient({ maxRetries: 0 })

            await expect(
                client.search({ search_val: "테스트" }),
            ).rejects.toThrow("서버 내부 처리 오류")
        })
    })

    describe("getCuration method", () => {
        it("should fetch curation with correct URL", async () => {
            const mockResponse: CurationResponse = {
                status: 200,
                errmsg: "",
                list: [],
                conf: {
                    idx: 59,
                    sub_title: "테스트",
                    title: "테스트",
                    bg_color: "#ffffff",
                    flag_adult: 0,
                    view_more_link: "/test",
                    sid: "test",
                    flag_apply: 1,
                    flag_icon_position: 0,
                    icon_url: "",
                },
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const result = await client.getCuration({ target: "million" })

            expect(result.status).toBe(200)
            expect(result.conf.idx).toBe(59)
            expect(mockFetch).toHaveBeenCalledTimes(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("cmd=million_novel_curation")
            expect(callUrl).toContain("main_group=59")
        })

        it("should handle curation with prev_million_flag", async () => {
            const mockResponse: CurationResponse = {
                status: 200,
                errmsg: "",
                list: [
                    {
                        novel_name: "테스트 소설",
                        novel_no: "1",
                        writer_nick: "작가",
                        cover_url: "",
                        link_url: "/novel/1",
                        novel_age: "0",
                        novel_genre: [],
                        novel_story: "",
                        novel_words: "",
                        novel_thumb: "",
                        mem_nick: "작가",
                        novel_free: "0",
                    },
                ],
                conf: {
                    idx: 59,
                    sub_title: "테스트",
                    title: "테스트",
                    bg_color: "#ffffff",
                    flag_adult: 0,
                    view_more_link: "/test",
                    sid: "test",
                    flag_apply: 1,
                    flag_icon_position: 0,
                    icon_url: "",
                },
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient()
            const params: CurationParams = {
                target: "million",
                rows: 100,
                prev_million_flag: true,
            }

            const result = await client.getCuration(params)

            expect(result.list).toHaveLength(1)
            const callUrl = (mockFetch.mock.calls[0][0] as string).toString()
            expect(callUrl).toContain("prev_million_flag=true")
        })

        it("should throw NovelPiaValidationError for invalid target", async () => {
            const client = new NovelPiaClient()
            await expect(
                client.getCuration({ target: "invalid" as any }),
            ).rejects.toThrow(NovelPiaValidationError)
        })
    })

    describe("Caching support", () => {
        it("should return cached result on second request and avoid network call", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 0,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient({ cache: true })

            const res1 = await client.search({ search_val: "테스트" })
            const res2 = await client.search({ search_val: "테스트" })

            expect(res1).toEqual(mockResponse)
            expect(res2).toEqual(mockResponse)
            expect(mockFetch).toHaveBeenCalledTimes(1)
        })

        it("should bypass cache when skipCache option is true", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 0,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient({ cache: true })

            await client.search({ search_val: "테스트" })
            await client.search({ search_val: "테스트" }, { skipCache: true })

            expect(mockFetch).toHaveBeenCalledTimes(2)
        })

        it("should clear cache when clearCache is called", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 0,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient({ cache: true })

            await client.search({ search_val: "테스트" })
            await client.clearCache()
            await client.search({ search_val: "테스트" })

            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

    describe("Interceptors", () => {
        it("should execute request and response interceptors", async () => {
            const mockResponse: NovelSearchResponse = {
                status: 200,
                code: "",
                errmsg: "",
                list: [],
                total_cnt: 10,
                block_cnt: 0,
                block_adult_cnt: 0,
                block_not_live_cnt: 0,
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            } as any)

            const client = new NovelPiaClient({ maxRetries: 0 })
            const requestInterceptor = jest.fn()
            const responseInterceptor = jest.fn()

            client
                .addRequestInterceptor(requestInterceptor)
                .addResponseInterceptor(responseInterceptor)

            await client.search({ search_val: "테스트" })

            expect(requestInterceptor).toHaveBeenCalledTimes(1)
            expect(responseInterceptor).toHaveBeenCalledTimes(1)
        })

        it("should execute error and retry interceptors on failures", async () => {
            mockFetch
                .mockRejectedValueOnce(new Error("fetch failed"))
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ status: 200, list: [], total_cnt: 0 }),
                } as any)

            const errorInterceptor = jest.fn()
            const retryInterceptor = jest.fn()

            const client = new NovelPiaClient({
                maxRetries: 1,
                retryBaseDelayMs: 10,
                retryMaxDelayMs: 20,
            })
            client
                .addErrorInterceptor(errorInterceptor)
                .addRetryInterceptor(retryInterceptor)

            await client.search({ search_val: "테스트" })

            expect(errorInterceptor).toHaveBeenCalledTimes(1)
            expect(retryInterceptor).toHaveBeenCalledTimes(1)
        })
    })

    describe("Rate Limit Handling", () => {
        it("should throw NovelPiaRateLimitError on 429 response", async () => {
            const mockHeaders = new Map([["Retry-After", "5"]])
            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                statusText: "Too Many Requests",
                headers: {
                    get: (key: string) => mockHeaders.get(key) || null,
                },
            } as any)

            const client = new NovelPiaClient({ maxRetries: 0 })

            await expect(
                client.search({ search_val: "테스트" }),
            ).rejects.toThrow(NovelPiaRateLimitError)
        })
    })
})
